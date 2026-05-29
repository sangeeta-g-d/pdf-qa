import chromadb

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("documents")

def store_chunks(chunks: list[str], embeddings: list):
    # Clear old data first (for simplicity)
    existing = collection.count()
    if existing > 0:
        collection.delete(where={"source": "pdf"})

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        metadatas=[{"source": "pdf"} for _ in chunks],
        ids=[f"chunk_{i}" for i in range(len(chunks))]
    )

def search_similar_chunks(query_embedding: list[float], top_k: int = 3) -> list[str]:
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    return results["documents"][0]