const HOMOGLYPH_MAP: Record<string, string> = {
  // Cyrillic lookalikes to Latin
  "\u0430": "a", "\u0410": "a", // а, А
  "\u0431": "b", "\u0411": "b", // б, Б
  "\u0432": "v", "\u0412": "v", // в, В
  "\u0434": "d", "\u0414": "d", // д, Д
  "\u0435": "e", "\u0415": "e", // е, Е
  "\u043E": "o", "\u041E": "o", // о, О
  "\u0440": "p", "\u0420": "p", // р, Р
  "\u0441": "c", "\u0421": "c", // с, С
  "\u0442": "t", "\u0422": "t", // т, Т
  "\u0443": "y", "\u0423": "y", // у, У
  "\u0445": "x", "\u0425": "x", // х, Х
  "\u043D": "n", "\u041D": "n", // н, Н
  "\u043C": "m", "\u041C": "m", // м, М
  "\u0456": "i", "\u0406": "i", // і, І
  "\u0458": "j", "\u0408": "j", // ј, Ј
  "\u0455": "s", "\u0405": "s", // ѕ, Ѕ
  // Greek lookalikes to Latin
  "\u03B1": "a", "\u0391": "a", // α, Α
  "\u03B5": "e", "\u0395": "e", // ε, Ε
  "\u03B9": "i", "\u0399": "i", // ι, Ι
  "\u03BF": "o", "\u039F": "o", // ο, Ο
  "\u03C1": "p", "\u03A1": "p", // ρ, Ρ
  "\u03BD": "v", "\u039D": "n", // ν (lowercase Nu -> v), Ν (uppercase Nu -> n)
  "\u03BA": "k", "\u039A": "k", // κ, Κ
  "\u03C4": "t", "\u03A4": "t", // τ, Τ
};

export function normalizeText(input: unknown): string {
  if (typeof input !== "string" || !input) return "";

  return input
    .normalize("NFKD") // Compatibility decomposition (full-width -> standard ASCII/Latin)
    .replace(/\p{Cf}/gu, "") // Strip all Unicode format characters (invisible, zero-width, word joiner, bidi controls)
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD]/g, "") // Explicit fallback for format & invisible chars
    .replace(/\p{M}/gu, "") // Strip combining accents/diacritical marks
    .replace(/[\u0027\u2018\u2019\u201A\u201B\u0060\u00B4\u02BC\u02B9\u02BB\u02BD\u02C8\u2032\u2035]/g, "") // Strip straight, curly, and modifier apostrophes
    .replace(/[\u0400-\u04FF\u0370-\u03FF]/gu, (ch) => HOMOGLYPH_MAP[ch] || ch) // Canonicalize homoglyphs
    .toLowerCase()
    .replace(/[-_/]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
