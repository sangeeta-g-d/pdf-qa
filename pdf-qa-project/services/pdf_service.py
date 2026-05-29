import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter


def extract_and_chunk_pdf(file_bytes: bytes) -> list[str]:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_text(full_text)
    return chunks