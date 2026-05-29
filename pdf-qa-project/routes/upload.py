from fastapi import APIRouter, UploadFile, File
from services.pdf_service import extract_and_chunk_pdf
from services.embedding_service import get_embedding
from services.vector_store import store_chunks

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    content = await file.read()
    chunks = extract_and_chunk_pdf(content)

    embeddings = [get_embedding(chunk) for chunk in chunks]
    store_chunks(chunks, embeddings)

    return {
        "message": f"✅ PDF uploaded successfully!",
        "chunks_stored": len(chunks)
    }