"""Embedding Indexer agent — chunk code and build vector index."""

from app.utils.embeddings import hash_embed, chunk_code


async def run_embedding_indexer(files: dict[str, str]) -> dict:
    """Chunk all files and generate embeddings."""
    all_vectors = []

    for path, content in files.items():
        chunks = chunk_code(content, chunk_lines=10, overlap=2)
        for chunk in chunks:
            embedding = hash_embed(chunk["content"])
            all_vectors.append({
                "path": path,
                "chunk": chunk["content"],
                "start_line": chunk["start_line"],
                "embedding": embedding,
            })

    return {
        "chunks": len(all_vectors),
        "files": len(files),
        "dim": 32,
        "method": "hash-fallback",
        "vectors": all_vectors,
    }
