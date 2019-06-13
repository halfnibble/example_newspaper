/* global $ */
import moment from 'moment'

const listArticlesQL = `
    query {
        articles {
            id
            title
            category
            published
            author {
                name
            }
            content {
                html
            }
        }
    }
`

const filteredArticlesQL = (filter) => `
    query {
        articles(where:{ category: ${filter} }) {
            id
            title
            category
            published
            author {
            name
            }
            content {
                html
            }
        }
    }
`

const renderArticle = (data, col=6) => {
    const dateView = new moment(data.published).format('MM/DD/YYYY hh:mm A')
    return `
        <article class="col-md-${col}">
            <div class="list-article">
                <h2>${data.title}</h2>
                <small>Published on: ${dateView}</small>
                <div>
                    ${data.content.html}
                </div>
            </div>
            <a href="?article=${data.id}">Read More</a>
        </article>
    `
}

const loadArticles = (query) => {
    $.post(
        {
            url: 'https://api-uswest.graphcms.com/v1/cjvx3xdjrb7px01ghu7z3xxtf/master',
            data: JSON.stringify({"query": query}),
            success: (response) => {
                const articles = response.data.articles
                let html = ''
                if (articles.length) {
                    let firstArticle = articles.shift()
                    html += renderArticle(firstArticle, 8)
                }
                if (articles.length) {
                    let secondArticle = articles.shift()
                    html += renderArticle(secondArticle, 4)
                }
                for (let article of articles) {
                    html += renderArticle(article)
                }
                $('main').html(html)
            },
            contentType: 'application/json'
        }
    )
}

const loadArticlesList = () => loadArticles(listArticlesQL)

const loadFilteredArticlesList = (filter) => {
    return loadArticles(filteredArticlesQL(filter))
}

export { loadArticlesList, loadFilteredArticlesList }
