<script>
    import Datetime from "$components/datetime.svelte"

    export let item;

    const { href, title, description, date, thumbnail } = item
</script>

<article>
    {#if thumbnail}
        {#if thumbnail.startsWith("https://www.youtube.com")}
            <iframe class="video thumbnail" src={thumbnail} title={title} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        {:else}
            <figure class="thumbnail">
                <img src={thumbnail} alt="thumbnail" />
            </figure>
        {/if}
    {/if}
    <div class="inner">
        <p>
            {#if date}
                <Datetime { date } />
            {/if}
        </p>
        <a href={href}>
            <h3>{ title }</h3>
        </a>
        <p class="description">{ description }</p>
    </div>
</article>

<style>
    article {
        border: 4px ridge;

        margin: 16px 0;
    }

    .inner {
        padding: 0 16px;
    }

    .description {
        word-break: break-all;
    }

    .video {
        aspect-ratio: 16/9;
    }

    .thumbnail {
        margin: 0;

        width: 100%;
    }
</style>
