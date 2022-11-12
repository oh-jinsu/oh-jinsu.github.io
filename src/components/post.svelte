<script>
    import Datetime from "$components/datetime.svelte"

    export let item;

    const { href, title, description, category, date, thumbnail } = item
</script>

<article>
    {#if thumbnail}
        <figure class="thumbnail">
            <img src={thumbnail} alt="thumbnail" />
        </figure>
    {/if}
    <div class="inner">
        <p>
            {#if category}
                {category} /
            {/if}
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
</style>