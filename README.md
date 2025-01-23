# Patent Vision PoC

Patent Vision is a Next.js application designed to streamline the process of analyzing patents by extracting meaningful and readable content, generating illustrative images, and producing audio summaries. Leveraging the power of OpenAI's GPT-4 for text summarization, DALL·E 3 for image generation, and advanced text-to-speech technologies, Patent Vision transforms complex patent documents into accessible and engaging formats.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Development Server](#running-the-development-server)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

## Features

- **PDF Upload & Parsing**: Easily upload patent PDF files and extract their textual content.
- **Text Summarization**: Generate concise and understandable summaries of complex patent documents using GPT-4.
- **Image Generation**: Create visual representations of patent concepts with DALL·E 3.
- **Audio Summarization**: Listen to spoken summaries of patents for a hands-free experience.
- **Structured Data Extraction**: Automatically extract key details such as the name, date, owner, and viability score of patents.
- **Responsive UI**: User-friendly interface optimized for various devices using TailwindCSS.

## Demo

*(Include a link to a live demo if available)*

## Technologies Used

- **[Next.js](https://nextjs.org)**: React framework for building server-side rendered and statically generated web applications.
- **[OpenAI API](https://openai.com/api/)**: For text summarization, image generation, and audio synthesis.
- **[Formidable](https://www.npmjs.com/package/formidable)**: Handles file uploads.
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)**: Extracts text from PDF files.
- **[TailwindCSS](https://tailwindcss.com)**: Utility-first CSS framework for rapid UI development.
- **[TypeScript](https://www.typescriptlang.org)**: Adds static typing to JavaScript for improved developer experience.
- **[Vercel](https://vercel.com)**: Platform for deploying Next.js applications seamlessly.

## Getting Started

### Prerequisites

- **Node.js** (v14 or later)
- **npm** or **yarn** package manager
- **OpenAI API Key**: Required to access OpenAI's services.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/patent-vision-poc.git
   cd patent-vision-poc
   ```

2. **Install Dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Using yarn:

   ```bash
   yarn install
   ```

### Environment Variables

Create a `.env.local` file in the root directory and add your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: Ensure that `.env.local` is included in your `.gitignore` to prevent sensitive information from being exposed.

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

1. **Upload a Patent PDF**

   - Click on the "Choose PDF" button.
   - Select a valid PDF file containing the patent document.

2. **Process the PDF**

   - Click on the "Upload & Process" button.
   - The application will extract the text, generate a summary, create an image, and produce an audio summary.

3. **View Results**

   - **Patent Details**: Displays structured data including the name, date, owner, and viability score.
   - **Summary**: Provides a concise summary of the patent.
   - **Generated Image**: Shows a visual representation based on the summary.
   - **Generated Audio**: Offers an audio version of the summary for easy listening.
   - **Extracted PDF Text**: Toggleable panel to view the raw extracted text from the PDF.

## API Endpoints

### `POST /api/upload-pdf`

Handles the upload and processing of patent PDF files.

- **Description**: 
  - Parses the uploaded PDF to extract text.
  - Summarizes the extracted text.
  - Generates an image based on the summary.
  - Produces an audio summary.
  - Extracts structured data (name, date, owner, viability score).

- **Request**:
  - **Form Data**:
    - `file`: The PDF file to be uploaded.

- **Response**: 
  - `extractedText`: The raw text extracted from the PDF.
  - `summary`: A concise summary of the patent.
  - `imageUrl`: URL of the generated image.
  - `audioData`: Base64-encoded audio data.
  - `strucresponse`: Structured data containing key patent details.

- **Example Response**:

  ```json
  {
    "extractedText": "Full text extracted from the PDF...",
    "summary": "A concise summary of the patent...",
    "imageUrl": "https://example.com/generated-image.png",
    "audioData": "base64encodedaudio...",
    "strucresponse": {
      "name": "Innovative Widget",
      "date": "2023-10-15",
      "owner": "Tech Corp",
      "viabilityScore": 8,
      "additionalInfo": "Additional relevant information..."
    }
  }
  ```

## Project Structure

```
.
├── pages
│   ├── api
│   │   └── upload-pdf.ts
│   └── index.tsx
├── public
│   └── images
├── styles
│   └── globals.css
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── .env.local
└── README.md
```

- **pages/api/upload-pdf.ts**: API route handling PDF uploads and processing.
- **pages/index.tsx**: Main front-end page.
- **public/images**: Directory for storing static images.
- **styles/globals.css**: Global styles using TailwindCSS.
- **tailwind.config.js**: TailwindCSS configuration.
- **tsconfig.json**: TypeScript configuration.
- **package.json**: Project dependencies and scripts.
- **.env.local**: Environment variables (excluded from version control).
- **README.md**: Project documentation.

## Contributing

Contributions are welcome! Follow these steps to contribute to Patent Vision PoC:

1. **Fork the Repository**

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add feature: YourFeatureName"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeatureName
   ```

5. **Open a Pull Request**

   Describe your changes and submit the pull request for review.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any inquiries or feedback, please reach out to [your-email@example.com](mailto:your-email@example.com).

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [OpenAI](https://openai.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)
- [Formidable](https://www.npmjs.com/package/formidable)
- [pdf-parse](https://www.npmjs.com/package/pdf-parse)
