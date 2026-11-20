import pathlib
src=pathlib.Path('src')
order=['engine','data','items','items2','items3','content25','maps7','physics','track','carmodel','icons','meters','audio','net','game','ui','ui25','packs','progress','events','final','v31','v32','v33','v34','v35','v36','v37','v38','v39','v40','v41','v42','v43','v44','v45','v46','v47','v48','v49','v50','v51','v52','v53','v54','v55','v56','v57','v58','v59','v60','v61','v62','v63','i18n_dict','i18n','main']
js='\n'.join((src/f'{n}.js').read_text() for n in order)
js='(function(){\n"use strict";\n'+js+'\n})();'
html=(src/'shell.html').read_text().replace('/*CSS*/',(src/'style.css').read_text()).replace('/*JS*/',js)
pathlib.Path('dist').mkdir(exist_ok=True); (pathlib.Path('dist')/'index.html').write_text(html)
(pathlib.Path('dist')/'check.js').write_text(js)
print(len(html))
