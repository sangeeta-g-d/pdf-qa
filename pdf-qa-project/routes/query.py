from fastapi import APIRouter
from pydantic import BaseModel
from services.embedding_service import get_embedding
from services.vector_store import search_similar_chunks
from services.llm_service import ask_llm

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

@router.post("/ask")
async def ask_question(request: QueryRequest):
    q_embedding = get_embedding(request.question)
    relevant_chunks = search_similar_chunks(q_embedding, top_k=3)
    answer = ask_llm(request.question, relevant_chunks)

    return {"answer": answer}