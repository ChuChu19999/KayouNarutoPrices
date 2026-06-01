import httpx

_http_client: httpx.AsyncClient | None = None

_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept": "text/html,application/json,application/xhtml+xml;q=0.9,*/*;q=0.8",
}


async def get_http_client() -> httpx.AsyncClient:
    """Общий HTTP-клиент с cookies для запросов к маркетплейсам."""
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(25.0),
            follow_redirects=True,
            headers=_BROWSER_HEADERS,
            cookies=httpx.Cookies(),
        )
    return _http_client


async def reset_http_client() -> None:
    """Сброс клиента перед новой пачкой запросов к магазинам."""
    await close_all_clients()


async def close_all_clients() -> None:
    """Закрытие внешних HTTP-клиентов при завершении приложения."""
    global _http_client
    if _http_client is not None:
        await _http_client.aclose()
        _http_client = None
