from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="qwen3.5:latest",
    temperature=0,
    num_ctx=16384,
    reasoning=False,
)
