// SDL/X clients consume key codes and modifier state, not DOM text insertion.
// Explicitly hold Shift for uppercase ASCII instead of relying on key text.
export async function typeText(page,text){
 for(const c of text){
  if(/^[A-Z]$/.test(c))await page.keyboard.press('Shift+Key'+c);
  else await page.keyboard.type(c);
 }
}
