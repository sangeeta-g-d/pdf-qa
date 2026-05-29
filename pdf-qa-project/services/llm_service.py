import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_llm(question: str, context_chunks: list[str]) -> str:
    context = "\n\n".join(context_chunks)

    prompt = f"""Answer the question using ONLY the context below.
If the answer is not in the context, say "I don't know based on the document."

Context:
{context}

Question: {question}
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content