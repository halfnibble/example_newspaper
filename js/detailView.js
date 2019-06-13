/* global $ */

const generateArticleQL = (id) => {
    return `
    query {
        article(where: {
            id: "${id}"
        }) {
            id
            title
            published
            author {
                name
            }
            category
            content {
                html
            }
        }
    }`
}

const renderArticle = (data) => {
    return `
        <article class="col-md-12">
            <h2>${data.title}</h2>
            <small>Published on: ${data.published}</small>
            <div class="feature">
                ${data.content.html}
            </div>
        </article>
    `
}

const loadArticle = (id) => {
    $.post(
        {
            url: 'https://api-uswest.graphcms.com/v1/cjvx3xdjrb7px01ghu7z3xxtf/master',
            data: JSON.stringify({"query": generateArticleQL(id)}),
            success: (response) => {
                console.log(response.data)
                const article = response.data.article
                const html = renderArticle(article)
                $('main').html(html)
            },
            contentType: 'application/json'
        }
    )
}

export { loadArticle }


