"""Load the local Qwen3-VL-4B weights and generate a short text reply."""
import sys
import time

import torch
from transformers import AutoModelForImageTextToText, AutoTokenizer

MODEL_DIR = sys.argv[1] if len(sys.argv) > 1 else "models/qwen3vl-4b"

t0 = time.time()
tok = AutoTokenizer.from_pretrained(MODEL_DIR)
model, info = AutoModelForImageTextToText.from_pretrained(
    MODEL_DIR, dtype=torch.bfloat16, device_map="cuda", output_loading_info=True
)
print("loaded in %.1fs" % (time.time() - t0))
print("missing:", sorted(info["missing_keys"])[:10], "unexpected:", sorted(info["unexpected_keys"])[:10])
print("vram GB:", round(torch.cuda.memory_allocated() / 1e9, 2))

msgs = [{"role": "user", "content": "In three sentences, what should a first-time founder focus on?"}]
ids = tok.apply_chat_template(msgs, add_generation_prompt=True, return_tensors="pt", return_dict=True).to("cuda")
t0 = time.time()
out = model.generate(**ids, max_new_tokens=120, do_sample=False)
n = out.shape[1] - ids["input_ids"].shape[1]
print("tok/s: %.1f" % (n / (time.time() - t0)))
print(tok.decode(out[0, ids["input_ids"].shape[1]:], skip_special_tokens=True))
