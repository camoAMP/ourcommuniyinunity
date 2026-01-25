from dotenv import load_dotenv
import os
from litellm import completion  # pip install litellm python-dotenv

load_dotenv("local.env")

keys = {
    "Perplexity": os.getenv("PERPLEXITY_API_KEY"),
    "Groq": os.getenv("GROQ_API_KEY"),
    "OpenRouter": os.getenv("OPENROUTER_API_KEY"),
    # Add others like GOOGLE_API_KEY
}

models = {
    "Perplexity": os.getenv("PERPLEXITY_MODEL"),
    "Groq": os.getenv("GROQ_MODEL", "groq/llama-3.3-70b-versatile"),
    "OpenRouter": os.getenv("OPENROUTER_MODEL", "openrouter/anthropic/claude-3.5-sonnet"),
}

perplexity_candidates = [
    "perplexity/sonar",
    "perplexity/sonar-pro",
    "perplexity/sonar-small-online",
    "perplexity/sonar-small-chat",
    "perplexity/sonar-medium-online",
    "perplexity/pplx-7b-online",
    "perplexity/pplx-70b-online",
    "perplexity/llama-3.1-sonar-small-128k-online",
    "perplexity/llama-3.1-sonar-large-128k-online",
]

for provider, key in keys.items():
    if key:
        model = models.get(provider)
        print(f"{provider}: ✅ Loaded ({key[:10]}...)")
        try:
            if provider == "Perplexity" and not model:
                last_error = None
                for candidate in perplexity_candidates:
                    try:
                        resp = completion(
                            model=candidate,
                            messages=[{"role": "user", "content": f"Say 'Tutor ready!' as a {provider} AI."}],
                            api_key=key,
                            max_tokens=20
                        )
                        print(f"  → {resp.choices[0].message.content.strip()} (model: {candidate})\n")
                        break
                    except Exception as e:
                        last_error = e
                else:
                    raise last_error or Exception("No working Perplexity model found.")
            else:
                if not model:
                    print(f"  → ❌ Error: Missing model. Set {provider.upper()}_MODEL in local.env\n")
                    continue
                resp = completion(
                    model=model,
                    messages=[{"role": "user", "content": f"Say 'Tutor ready!' as a {provider} AI."}],
                    api_key=key,
                    max_tokens=20
                )
                print(f"  → {resp.choices[0].message.content.strip()}\n")
        except Exception as e:
            print(f"  → ❌ Error: {e}\n")
    else:
        print(f"{provider}: ❌ Missing key\n")
