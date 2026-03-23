import Foundation
import Vision
import AppKit

struct OCRLine: Codable {
  let text: String
  let confidence: Float
}

struct OCRResult: Codable {
  let file: String
  let rotation: String
  let score: Float
  let text: [String]
}

struct OrientationPass {
  let label: String
  let orientation: CGImagePropertyOrientation
}

func scoreLine(_ line: OCRLine) -> Float {
  let trimmed = line.text.trimmingCharacters(in: .whitespacesAndNewlines)
  guard !trimmed.isEmpty else { return 0 }
  let lengthBonus = min(Float(trimmed.count), 20)
  let alphaCount = trimmed.filter(\.isLetter).count
  let alphaRatio = trimmed.isEmpty ? 0 : Float(alphaCount) / Float(trimmed.count)
  let ratioBonus = 0.5 + alphaRatio
  return line.confidence * lengthBonus * ratioBonus
}

func recognizeText(at url: URL, orientation: CGImagePropertyOrientation) throws -> [OCRLine] {
  guard let image = NSImage(contentsOf: url) else {
    throw NSError(domain: "OCR", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not open image \(url.path)"])
  }

  var rect = NSRect(origin: .zero, size: image.size)
  guard let cgImage = image.cgImage(forProposedRect: &rect, context: nil, hints: nil) else {
    throw NSError(domain: "OCR", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not create CGImage for \(url.path)"])
  }

  let request = VNRecognizeTextRequest()
  request.recognitionLevel = .accurate
  request.usesLanguageCorrection = false
  request.minimumTextHeight = 0.01

  let handler = VNImageRequestHandler(cgImage: cgImage, orientation: orientation, options: [:])
  try handler.perform([request])

  let results = request.results ?? []
  let observations: [OCRLine] = results.compactMap { observation in
    guard let candidate = observation.topCandidates(1).first else { return nil }
    let text = candidate.string.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !text.isEmpty else { return nil }
    return OCRLine(text: text, confidence: candidate.confidence)
  }

  return observations
}

let arguments = CommandLine.arguments
guard arguments.count >= 2 else {
  fputs("Usage: swift ocr_forms.swift <image-path> [<image-path> ...]\n", stderr)
  exit(1)
}

var results: [OCRResult] = []

for rawPath in arguments.dropFirst() {
  let url = URL(fileURLWithPath: rawPath)
  do {
    let passes = [
      OrientationPass(label: "0", orientation: .up),
      OrientationPass(label: "90", orientation: .right),
      OrientationPass(label: "180", orientation: .down),
      OrientationPass(label: "270", orientation: .left)
    ]

    let scoredPasses = try passes.map { pass in
      let lines = try recognizeText(at: url, orientation: pass.orientation)
      let score = lines.reduce(Float(0)) { partialResult, line in
        partialResult + scoreLine(line)
      }
      return (pass: pass, lines: lines, score: score)
    }

    guard let bestPass = scoredPasses.max(by: { $0.score < $1.score }) else {
      continue
    }

    results.append(
      OCRResult(
        file: url.lastPathComponent,
        rotation: bestPass.pass.label,
        score: bestPass.score,
        text: bestPass.lines.map(\.text)
      )
    )
  } catch {
    fputs("Failed \(url.lastPathComponent): \(error.localizedDescription)\n", stderr)
  }
}

let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
let data = try encoder.encode(results)
FileHandle.standardOutput.write(data)
