# PDF Filler API for Vercel

This is a serverless version of the PDF Filler API, designed to run on Vercel's free tier.

## Features

- Fill in PDF forms with JSON data
- Make form fields read-only by flattening the PDF
- Return the filled PDF in two formats:
  - JSON response with a base64-encoded PDF
  - Binary PDF response for direct download

## Endpoints

### Health Check
```
GET /health
```

### Fill PDF (JSON Response)
```
POST /fill-pdf
```

Accepts a JSON payload and returns a JSON response with the base64-encoded filled PDF.

### Fill PDF (Binary Response)
```
POST /fill-pdf-binary
```

Accepts a JSON payload and returns the filled PDF directly as a binary file.

## Payload Format

```json
[
  {
    "fileUrl": "https://example.com/path/to/template.pdf"
  },
  {
    "filename": "output.pdf",
    "record": {
      "field1": "value1",
      "field2": "value2",
      "checkbox1": true
    }
  }
]
```

Alternate format:

```json
{
  "fileUrl": "https://example.com/path/to/template.pdf",
  "filename": "output.pdf",
  "record": {
    "field1": "value1",
    "field2": "value2",
    "checkbox1": true
  }
}
```

## Deployment

1. Fork this repository
2. Link it to your Vercel account
3. Deploy with the Vercel CLI:

```
npm install
npm run deploy
```

## Notes for Vercel Deployment

- This serverless version doesn't store files locally
- Template PDFs must be provided via URL
- Filled PDFs are either returned as base64 or binary data 