import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('file:///home/claude/dl/dist/index.html');await pg.wait_for_timeout(2000)
    await pg.evaluate("()=>{const D=window.__DL;D.SAVE.data.tutDone=true;D.UI._newsShown=true;D.UI._logChk=true}")
    await pg.click('#btnStart');await pg.wait_for_timeout(1000)
    r=await pg.evaluate("""()=>{const X=window.__DLX,A=window.__DL.AUDIO,U=window.__DL.UI;const before=[A.music.cat,A.music.track&&A.music.track.id];
      X.MENU_MUSIC.src='tr:t12';A.playCat(A.music.cat,true);const after=A.music.track&&A.music.track.id;
      U.goMenu();const again=A.music.track&&A.music.track.id;
      U.open('garage');const gar=[A.music.cat,A.music.track&&A.music.track.id];U.open('tuning');gar.push(A.music.track&&A.music.track.id);U.goMenu();X.MENU_MUSIC.src='';A.playCat('race',true);gar.push(A.music.cat);return [before,after,again,gar]}""")
    print(r,errs);await b.close()
asyncio.run(main())
