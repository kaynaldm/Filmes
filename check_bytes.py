with open("Filmes-Series.m3u8", "rb") as f:
    sample = f.read(1000)
    idx = sample.find(b"Lan")
    if idx != -1:
        print("Raw bytes around Lan:", sample[idx:idx+20])
    idx2 = sample.find(b"S")
    print("Sample start:", sample[:300])
