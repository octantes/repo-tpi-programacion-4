import unicodedata

def normalizar_texto(texto: str) -> str:
    protegido = texto.replace("ñ", "\ue000").replace("Ñ", "\ue000")
    sin_acentos = "".join(
        caracter
        for caracter in unicodedata.normalize("NFD", protegido)
        if unicodedata.category(caracter) != "Mn"
    )
    return sin_acentos.replace("\ue000", "ñ").lower()