<script>
	import { page } from '$app/stores';
	import { ORIGIN, TITLE } from '$constants';

	const url = `${ORIGIN}${decodeURI($page.url.pathname)}`

	export let title

	export let description

    let keywords = []

	export let thumbnail

	const thumbnailUrl = thumbnail?.startsWith("/") ? `${ORIGIN}${thumbnail}` : thumbnail

	export let author

	export let noindex = false
</script>

<svelte:head>
    {#if noindex}
        <meta name="robots" content="noindex" />
    {/if}
        <title>{title ? `${title} - ${TITLE}` : TITLE}</title>
        {#if description}
            <meta name="description" content={description} />
        {/if}
    {#if keywords.length > 0}
        <meta name="keywords" content={keywords.join(", ")} />
    {/if}
    {#if author}
        <meta name="author" content={author} />
    {/if}
    <meta property="og:title" content={title} />
    {#if description}
        <meta property="og:description" content={description} />
    {/if}
    <meta property="og:url" content={url} />
    {#if thumbnailUrl}
        <meta property="og:image" content={thumbnailUrl} />
    {/if}
    <meta property="og:type" content="website" />
    <meta name="twitter:title" content={title} />
    {#if description}
        <meta name="twitter:description" content={description} />	
    {/if}
    {#if thumbnailUrl}
        <meta name="twitter:image" content={thumbnailUrl} />
        <meta name="twitter:card" content="summary_large_image" />
    {/if}
    <link rel="canonical" href={url} />
</svelte:head>
