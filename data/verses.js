var ignores = [
  "all",
  "also",
  "an",
  "and",
  "away",
  "begun",
  "But",
  "cut",
  "doth",
  "even",
  "for",
  "go",
  "in",
  "hath",
  "let",
  "look",
  "many",
  "mine",
  "might",
  "nay",
  "o",
  "of",
  "one",
  "part",
  "put",
  "seen",
  "sent",
  "set",
  "shalt",
  "tables",
  "things",
  "three",
  "thus",
  "to",
  "told",
  "two",
  "unto",
  "use",
  "whether",
  "ye",
  "yet"
];

var xmlhttp = new window.XMLHttpRequest();
xmlhttp.open("GET", "https://yucigou.github.io/bible/xml/kjv.xml", false);
xmlhttp.send(null);
g_kjvXmlDoc = xmlhttp.responseXML.documentElement;
books = g_kjvXmlDoc.getElementsByTagName("BOOK");

let allVerses = "";
for (i = 0; i < books.length; i += 1) {
  book_no = books[i].getElementsByTagName("BOOK_NO")[0].childNodes[0].nodeValue;
  if (book_no != "47") {
    continue;
  }
  chapters = books[i].getElementsByTagName("CHAPTER");
  abbr = books[i].getElementsByTagName("ABBR")[0].childNodes[0].nodeValue;

  for (j = 0; j < chapters.length; j += 1) {
    chapter_no = chapters[j].getElementsByTagName("CHAPTER_NO")[0].childNodes[0]
      .nodeValue;

    verses = chapters[j].getElementsByTagName("VERSE");
    for (k = 0; k < verses.length; k += 1) {
      let verse;
      verse_no = verses[k].getElementsByTagName("VERSE_NO")[0].childNodes[0]
        .nodeValue;
      try {
        verse = verses[k].getElementsByTagName("CONTENT")[0].childNodes[0]
          .nodeValue;
      } catch (e) {
        verse = "";
      }
      ignores.forEach(ignore => {
        var regEx = new RegExp(`(^|\\W)${ignore}\\W`, "ig");
        var replaceMask = " ";
        verse = verse.replace(regEx, replaceMask);
      });
      allVerses += verse;
    }
  }
}

console.log(allVerses);
