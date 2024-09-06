/** @type {import('./$types').RequestHandler} */
export async function GET({fetch, url}) {
    const response = await fetch(`https://www.when2meet.com/${url.search}`, {
            headers : {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8",
            },
        }
    )
    const responseText = await response.text();
    return new Response(responseText);
};