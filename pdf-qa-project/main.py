from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, query

app = FastAPI(title="PDF Q&A System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(query.router)

@app.get("/")
def root():
    return {"message": "PDF Q&A System is running!"}