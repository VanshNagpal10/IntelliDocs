# IntelliDocs 📄🤖

**IntelliDocs** is an AI-powered intelligent document analyzer that allows you to upload various document types (PDFs, images, DOCX, TXT) and ask natural language questions about their content. The application uses advanced OCR technology for scanned documents and leverages AI to provide accurate answers about document content, word counts, line locations, and summaries.

## ✨ Features

- **Multi-Format Support**: Upload PDFs, images (JPG, PNG, GIF, BMP, WEBP), DOCX, TXT, PPT, and PPTX files
- **OCR Technology**: Extract text from scanned PDFs and images using Tesseract OCR
- **AI-Powered Analysis**: Ask natural language questions about your documents using GPT-4o-mini
- **Intelligent Text Extraction**: 
  - Native PDF text extraction with OCR fallback for scanned documents
  - DOCX text extraction using Mammoth
  - Image-to-text conversion with OCR
  - Plain text file support
- **Multi-Document Analysis**: Upload and analyze multiple documents simultaneously
- **Advanced Queries**: 
  - Count word occurrences
  - Find specific line numbers
  - Summarize content
  - Extract insights and patterns
- **Modern UI**: Beautiful, responsive interface built with React and TailwindCSS
- **Drag & Drop**: Easy file upload with drag-and-drop support
- **Real-time Processing**: See upload progress and document statistics instantly

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.5.4](https://nextjs.org/)** - React framework with App Router
- **[React 19.1.0](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[TailwindCSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[class-variance-authority](https://cva.style/)** - CVA for component variants

### Backend & APIs
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Serverless API endpoints
- **[OpenAI API](https://openai.com/)** - AI-powered document analysis 
- **Node.js File System** - Server-side file handling

### Document Processing
- **[unpdf](https://www.npmjs.com/package/unpdf)** - PDF text extraction
- **[node-tesseract-ocr](https://www.npmjs.com/package/node-tesseract-ocr)** - OCR for scanned documents
- **[mammoth](https://www.npmjs.com/package/mammoth)** - DOCX to text conversion
- **[officeparser](https://www.npmjs.com/package/officeparser)** - Office document parsing
- **[pdfjs-dist](https://mozilla.github.io/pdf.js/)** - PDF.js for PDF processing

### Utilities
- **[uuid](https://www.npmjs.com/package/uuid)** - Unique identifier generation
- **[dotenv](https://www.npmjs.com/package/dotenv)** - Environment variable management

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

1. **Node.js** (v20 or higher)
2. **npm** or **yarn** or **pnpm**
3. **Tesseract OCR** (Required for OCR functionality)

### Installing Tesseract OCR

#### macOS
```bash
brew install tesseract
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

#### Windows
Download and install from: https://github.com/UB-Mannheim/tesseract/wiki

4. **GitHub Token** (for AI features)
   - Get a GitHub Personal Access Token with access to GitHub Models
   - Visit: https://github.com/settings/tokens

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd intelli-docs
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# GitHub Token for AI Models (Required)
GITHUB_TOKEN=your_github_personal_access_token_here
```

**How to get a GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes as needed
4. Copy the token and paste it in `.env.local`

### 4. Verify Tesseract Installation

```bash
tesseract --version
```

You should see version information. If not, install Tesseract following the prerequisites section.

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

## 📖 Usage

### Uploading Documents

1. **Drag & Drop**: Drag files directly onto the upload area
2. **Click to Browse**: Click the upload area to select files from your system
3. **Supported Formats**: PDF, JPG, PNG, GIF, BMP, WEBP, DOC, DOCX, TXT, PPT, PPTX

### Asking Questions

Once documents are uploaded, you can ask questions like:

- "How many times does the word 'AI' appear?"
- "Summarize the main points of the document"
- "On which lines does 'machine learning' appear?"
- "What are the key findings?"
- "Count all occurrences of 'Vansh'"

### Example Workflow

1. Upload a PDF document
2. Wait for processing (you'll see line count and word count)
3. Type your question in the text area
4. Press Enter or click the Send button
5. View the AI-generated answer

## 📁 Project Structure

```
intelli-docs/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ask/
│   │   │   │   └── route.ts          # AI question answering endpoint
│   │   │   └── upload/
│   │   │       └── route.ts          # File upload & text extraction
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── button.tsx        # Button component
│   │   │   │   └── textarea.tsx      # Textarea component
│   │   │   ├── DocumentUploader.tsx  # File upload component
│   │   │   └── HeroSection.tsx       # Navigation header
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main page
│   └── lib/
│       └── utils.ts                  # Utility functions
├── public/                           # Static assets
├── tmp_uploads/                      # Temporary file storage
│   └── store.json                    # Document metadata store
├── .env.local                        # Environment variables (create this)
├── .gitignore
├── components.json                   # shadcn/ui config
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## 🔌 API Endpoints

### POST `/api/upload`

Upload and process a document.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (File)

**Response:**
```json
{
  "success": true,
  "docId": "uuid-string",
  "fileName": "example.pdf",
  "linesCount": 150,
  "wordCount": 1200,
  "charCount": 8500,
  "extractionMethod": "PDF text extraction"
}
```

**Extraction Methods:**
- `"PDF text extraction"` - Native PDF text extraction
- `"OCR (scanned PDF)"` - Tesseract OCR for scanned PDFs
- `"OCR (image)"` - Tesseract OCR for images
- `"DOCX text extraction"` - Mammoth for DOCX files
- `"Plain text"` - Direct text file reading

### POST `/api/ask`

Ask questions about uploaded documents.

**Request:**
```json
{
  "docIds": ["uuid-1", "uuid-2"],
  "question": "How many times does 'AI' appear?"
}
```

**Response:**
```json
{
  "answer": "The word 'AI' appears 15 times in the document.",
  "documents": [
    {
      "id": "uuid-1",
      "fileName": "example.pdf",
      "wordCount": 1200,
      "lineCount": 150
    }
  ],
  "question": "How many times does 'AI' appear?"
}
```

## 🧠 How It Works

### Text Extraction Flow

1. **File Upload**: User uploads a document
2. **Type Detection**: System detects file type (PDF, image, DOCX, TXT)
3. **Text Extraction**:
   - **PDFs**: Try native extraction first, fallback to OCR if needed
   - **Images**: Use Tesseract OCR
   - **DOCX**: Use Mammoth library
   - **TXT**: Direct reading
4. **Storage**: Store extracted text with metadata in JSON
5. **Analysis Ready**: Document is ready for AI analysis

### AI Question Answering

1. **Question Input**: User types a question
2. **Context Building**: System loads all uploaded documents
3. **Prompt Engineering**: Creates a detailed prompt with document content
4. **AI Processing**: Sends to GPT-4o-mini via GitHub Models
5. **Response**: Returns accurate, context-aware answer

## 🎨 Styling & Theme

The project uses TailwindCSS with a custom theme configuration. The UI supports both light and dark modes and follows modern design principles:

- Responsive design for all screen sizes
- Smooth animations and transitions
- Accessible components from Radix UI
- Gradient text effects
- Beautiful hover states

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env.local` to version control
- **File Storage**: Files are stored temporarily in `tmp_uploads/`
- **API Keys**: GitHub token is kept server-side only
- **Input Validation**: All file types are validated before processing
- **Error Handling**: Comprehensive error handling for all operations

## 🐛 Troubleshooting

### OCR Not Working

**Issue**: "Failed to perform OCR. Make sure Tesseract is installed."

**Solution**:
1. Install Tesseract (see Prerequisites)
2. Verify installation: `tesseract --version`
3. On macOS, try: `brew reinstall tesseract`

### AI Not Responding

**Issue**: "AI service not configured. Please set GITHUB_TOKEN in .env.local"

**Solution**:
1. Create `.env.local` file
2. Add your GitHub token: `GITHUB_TOKEN=your_token_here`
3. Restart the development server

### File Upload Failing

**Issue**: Upload progress stuck or errors

**Solution**:
1. Check file type is supported
2. Ensure file size is reasonable
3. Check `tmp_uploads/` directory exists and is writable

## 📝 Development Scripts

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy this application:

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com/new)
3. Add environment variable: `GITHUB_TOKEN`
4. Deploy!

**Note**: Ensure Tesseract OCR is available in your deployment environment. For Vercel, you may need to use a custom build with Tesseract included or use alternative OCR services.

### Deploy on Other Platforms

For platforms like Railway, Render, or AWS:

1. Ensure Node.js runtime is available
2. Install Tesseract OCR in the build environment
3. Set environment variables
4. Run `npm run build && npm start`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [OpenAI](https://openai.com/) via [GitHub Models](https://github.com/marketplace/models)
- OCR powered by [Tesseract](https://github.com/tesseract-ocr/tesseract)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## 📧 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Made with ❤️ using Next.js and AI**
