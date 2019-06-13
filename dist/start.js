/* global URLSearchParams $ js_page */

import { loadArticlesList, loadFilteredArticlesList } from './listView'
import { loadArticle } from './detailView'
import { renderMenuItems } from './categories'
import { login } from './api'
import crypto from 'crypto'
import path from 'path'
export { path, crypto }

renderMenuItems()

let params = new URLSearchParams(window.location.search)

if (typeof js_page !== 'undefined' && js_page === 'articles') {
    // Only run on the articles pages.
    if (params.get('article') !== null) {
        const id = params.get('article')
        loadArticle(id)
    } else if (params.get('filter') !== null) {
        loadFilteredArticlesList(params.get('filter'))
    } else {
        loadArticlesList()
    }
}


