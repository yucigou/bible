/*
 * Functionalities:
 * 	1. Initialise and manipulate the form
 *  2. Read the Bible
 *  3. Search the Bible
 * 
 * Prerequisites:
 * 	1. const.js
 *  2. const_gb2312.js or const_big5.js
 * 
 * Author:
 * 	Yuci Gou, Cambridge Chinese Christian Church, UK
 * 
 * Version 1: 14 April 2009
 * ***************************************************************************/
var g_cuvXmlDoc;
var g_nivXmlDoc;
var g_bevXmlDoc;
var g_kjvXmlDoc;

var g_nivOn   = false;
var g_bevOn   = false;
var g_kjvOn   = false;

var g_currentBook = 1;
var g_currentChapter = 1;
var g_lastChapterOfLastBook;
var g_popupWindow = null;
var g_refreshPage = true;

/*
 * To support multiple languages
 */
function getChapterTitle(cnum) {
	var chapter;
	if (BIBLE_ID == BIBLE_CUV_GB2312) {
		chapter = "第" + CHAPTER_NO[cnum] + "章";
	} else if (BIBLE_ID == BIBLE_CUV_BIG5) {
		chapter = "第" + CHAPTER_NO[cnum] + "章";
	}
	return chapter;
}

/*
 * To support multiple languages
 */
function getChapterOption(chapter_no) {
	var chapter;
	if (BIBLE_ID == BIBLE_CUV_GB2312) {
		chapter = "第 " + chapter_no + " 章";
	} else if (BIBLE_ID == BIBLE_CUV_BIG5) {
		chapter = "第 " + chapter_no + " 章";
	}
	return chapter;
}

function setNivBox(isChecked) {
	setNiv(isChecked);
	if (g_refreshPage) {
		readChapter(g_currentBook, g_currentChapter);
	}
}

function setBevBox(isChecked) {
	setBev(isChecked);
	if (g_refreshPage) {
		readChapter(g_currentBook, g_currentChapter);
	}
}

function setNiv(isChecked) {
	if (isChecked == true) {
		g_nivOn = true;
		if (!g_nivXmlDoc) {
			loadNivXML();
		}
	} else {
		g_nivOn = false;
	}
}

function setBev(isChecked) {
	if (isChecked == true) {
		g_bevOn = true;
		if (!g_bevXmlDoc) {
			loadBevXML();
		}
	} else {
		g_bevOn = false;
	}
}

function setKjvBox(isChecked) {
	setKjv(isChecked);
	if (g_refreshPage) {
		readChapter(g_currentBook, g_currentChapter);
	}
}
function setKjv(isChecked) {
	if (isChecked == true) {
		g_kjvOn = true;
		if (!g_kjvXmlDoc) {
			loadKjvXML();
		}
	} else {
		g_kjvOn = false;
	}
}

function loadXML() {
	try // Internet Explorer
	{
		g_cuvXmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		g_cuvXmlDoc.async = false;
		g_cuvXmlDoc.load(UNION_XML_FILENAME);
	} catch (e) {
		try // Chrome, Firefox, Mozilla, Opera, etc.
		{
			var xmlhttp = new window.XMLHttpRequest();
			xmlhttp.open("GET", UNION_XML_FILENAME, false);
			xmlhttp.send(null);
			g_cuvXmlDoc = xmlhttp.responseXML.documentElement;
		} catch (e) {
			alert(e.message);
			return;
		}
	}
}

function loadBevXML() {
	try // Internet Explorer
	{
		g_bevXmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		g_bevXmlDoc.async = false;
		g_bevXmlDoc.load(UNION_XML_FILENAME_BEV);
	} catch (e) {
		try // Firefox, Mozilla, Opera, etc.
		{
			var xmlhttp = new window.XMLHttpRequest();
			xmlhttp.open("GET", UNION_XML_FILENAME_BEV, false);
			xmlhttp.send(null);
			g_bevXmlDoc = xmlhttp.responseXML.documentElement;
		} catch (e) {
			alert(e.message);
			return;
		}
	}
}

function loadNivXML() {
	try // Internet Explorer
	{
		g_nivXmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		g_nivXmlDoc.async = false;
		g_nivXmlDoc.load(UNION_XML_FILENAME_NIV);
	} catch (e) {
		try // Firefox, Mozilla, Opera, etc.
		{
			var xmlhttp = new window.XMLHttpRequest();
			xmlhttp.open("GET", UNION_XML_FILENAME_NIV, false);
			xmlhttp.send(null);
			g_nivXmlDoc = xmlhttp.responseXML.documentElement;
		} catch (e) {
			alert(e.message);
			return;
		}
	}
}

function loadKjvXML() {
	try // Internet Explorer
	{
		g_kjvXmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		g_kjvXmlDoc.async = false;
		g_kjvXmlDoc.load(UNION_XML_FILENAME_KJV);
	} catch (e) {
		try // Firefox, Mozilla, Opera, etc.
		{
			var xmlhttp = new window.XMLHttpRequest();
			xmlhttp.open("GET", UNION_XML_FILENAME_KJV, false);
			xmlhttp.send(null);
			g_kjvXmlDoc = xmlhttp.responseXML.documentElement;
		} catch (e) {
			alert(e.message);
			return;
		}
	}
}

function initPage() {	
	loadXML();
	// Initialise the control panel
	setBook("select_book_id");
	setChapter(FIRST_BOOK_NO, "select_chapter_id");
	
	// Display the first chapter
	readChapter(FIRST_BOOK_NO, FIRST_CHAPTER_NO);
}

function param()
{
    this.array = new Array(3);

    this.setChapter = function(v) {
    	this.array[0] = v; 
    }
    this.getChapter = function()  { 
    	return this.array[0]; 
    }
    
    this.setVerse = function(v) { 
    	this.array[1] = v; 
    }
    this.getVerse = function()  { 
    	return this.array[1]; 
    }

    this.setChapterEn = function(v) {
    	this.array[2] = v; 
    }
    this.getChapterEn = function()  { 
    	return this.array[2]; 
    }
}

function getContent(bnum, cnum, highlight_vnum) {
	var book_no;
	var chapter_no;
	var verse_no;
	var title;
	var english_chapter = "";
	
	var version = g_cuvXmlDoc.getElementsByTagName("VERSION")[0].childNodes[0].nodeValue;
	var bev_version;
	var kjv_version;
	var niv_version;
	if (g_bevOn) {
		bev_version = g_bevXmlDoc.getElementsByTagName("VERSION")[0].childNodes[0].nodeValue;
	}
	if (g_kjvOn) {
		kjv_version = g_kjvXmlDoc.getElementsByTagName("VERSION")[0].childNodes[0].nodeValue;
	}
	if (g_nivOn) {
		niv_version = g_nivXmlDoc.getElementsByTagName("VERSION")[0].childNodes[0].nodeValue;
	}
	
	var books = g_cuvXmlDoc.getElementsByTagName("BOOK");	
	var bev_books;
	var kjv_books;
	var niv_books;
	if (g_bevOn) {
		bev_books = g_bevXmlDoc.getElementsByTagName("BOOK");
	}
	if (g_kjvOn) {
		kjv_books = g_kjvXmlDoc.getElementsByTagName("BOOK");
	}
	if (g_nivOn) {
		niv_books = g_nivXmlDoc.getElementsByTagName("BOOK");
	}

	var chapters;
	var bev_chapters;
	var kjv_chapters;
	var niv_chapters;
	
	var verses;	
	var bev_verses;
	var kjv_verses;
	var niv_verses;

	var verse;
	var bev_verse;
	var kjv_verse;
	var niv_verse;

	var html_verses = "<TABLE border='0' width='100%' cellspacing='5'>";
	var html_chapter = "";

	for (i = 0; i < books.length; i += 1) {
		book_no = books[i].getElementsByTagName("BOOK_NO")[0].childNodes[0].nodeValue;
		title = books[i].getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
		if (g_nivOn) {
			english_chapter = niv_books[i].getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
		} else if (g_kjvOn) {
			english_chapter = kjv_books[i].getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
		} else if (g_bevOn) {
			english_chapter = bev_books[i].getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
		}
		
		chapters = books[i].getElementsByTagName("CHAPTER");
		if (g_bevOn) {
			bev_chapters = bev_books[i].getElementsByTagName("CHAPTER");
		}
		if (g_kjvOn) {
			kjv_chapters = kjv_books[i].getElementsByTagName("CHAPTER");
		}
		if (g_nivOn) {
			niv_chapters = niv_books[i].getElementsByTagName("CHAPTER");
		}

		if (book_no == bnum) {
			html_chapter = title;

			for (j = 0; j < chapters.length; j += 1) {
				chapter_no = chapters[j].getElementsByTagName("CHAPTER_NO")[0].childNodes[0].nodeValue;
				if (chapter_no == cnum) {
					html_chapter = html_chapter + " " + getChapterTitle(cnum);
					if (g_bevOn || g_kjvOn || g_nivOn) {
						english_chapter = " - "+ english_chapter + " " + cnum;
					}

					verses = chapters[j].getElementsByTagName("VERSE");
					if (g_bevOn) {
						bev_verses = bev_chapters[j].getElementsByTagName("VERSE");
					}
					if (g_kjvOn) {
						kjv_verses = kjv_chapters[j].getElementsByTagName("VERSE");
					}
					if (g_nivOn) {
						niv_verses = niv_chapters[j].getElementsByTagName("VERSE");
					}
					
					for (k = 0; k < verses.length; k += 1) {
						verse_no = verses[k].getElementsByTagName("VERSE_NO")[0].childNodes[0].nodeValue;
						try {
							verse = verses[k].getElementsByTagName("CONTENT")[0].childNodes[0].nodeValue;							
						} catch (e) {
							// The verse is the same as last one.
							verse = "";
						}

						if (g_bevOn) {
							try {
								bev_verse = bev_verses[k].getElementsByTagName("CONTENT")[0].childNodes[0].nodeValue;							
							} catch (e) {
								bev_verse = "";
							}
						}
						if (g_kjvOn) {
							try {
								kjv_verse = kjv_verses[k].getElementsByTagName("CONTENT")[0].childNodes[0].nodeValue;							
							} catch (e) {
								kjv_verse = "";
							}
						}
						if (g_nivOn) {
							try {
								niv_verse = niv_verses[k].getElementsByTagName("CONTENT")[0].childNodes[0].nodeValue;							
							} catch (e) {
								niv_verse = "";
							}
						}

						var verseNumbered = false;
						if (g_nivOn) {
							if (verseNumbered) {
								html_verses += "<tr><td class='verse_no'></td>";								
							} else {
								html_verses += "<tr><td class='verse_no'>" + verse_no +"</td>";
								verseNumbered = true;
							}
							html_verses += "<td class='version'>[" + niv_version + "]</td>";
							if (verse_no == highlight_vnum) {
								niv_verse = "<span class = 'pattern'>" + niv_verse
										+ "</span>";
							}
							html_verses += "<td>" + niv_verse + "</td></tr>";							
						}
						if (g_kjvOn) {
							if (verseNumbered) {
								html_verses += "<tr><td class='verse_no'></td>";								
							} else {
								html_verses += "<tr><td class='verse_no'>" + verse_no +"</td>";
								verseNumbered = true;
							}
							html_verses += "<td class='version'>[" + kjv_version + "]</td>";
							if (verse_no == highlight_vnum) {
								kjv_verse = "<span class = 'pattern'>" + kjv_verse
										+ "</span>";
							}
							html_verses += "<td>" + kjv_verse + "</td></tr>";							
						}
						if (g_bevOn) {
							if (verseNumbered) {
								html_verses += "<tr><td class='verse_no'></td>";								
							} else {
								html_verses += "<tr><td class='verse_no'>" + verse_no +"</td>";
								verseNumbered = true;
							}
							html_verses += "<td class='version'>[" + bev_version + "]</td>";
							if (verse_no == highlight_vnum) {
								bev_verse = "<span class = 'pattern'>" + bev_verse
										+ "</span>";
							}
							html_verses += "<td>" + bev_verse + "</td></tr>";							
						}
						
						if (verseNumbered) {
							html_verses += "<tr><td class='verse_no'></td>";								
						} else {
							html_verses += "<tr><td class='verse_no'>" + verse_no +"</td>";
							verseNumbered = true;
						}
						if (g_bevOn || g_kjvOn || g_nivOn) {
							html_verses += "<td class='cn_version'>[" + version + "]</td>";
						}
						
						if (verse_no == highlight_vnum) {
							verse = "<span class = 'pattern'>" + verse
									+ "</span>";
						}
						if (g_bevOn || g_kjvOn || g_nivOn) {
							html_verses += "<td class='first_verse'>" + verse + "</td></tr>";
						} else {
							if (k % 2) {
								html_verses += "<td>" + verse + "</td></tr>";
							} else {
								html_verses += "<td class='first_verse'>" + verse + "</td></tr>";
							}
						}						
					}

					break;
				}
			}

			break;
		}

		g_lastChapterOfLastBook = chapters.length;
	}
	html_verses += "</TABLE>";

	var s = new param;
	s.setChapter(html_chapter)
	s.setChapterEn(english_chapter);
	s.setVerse(html_verses);
	
	return s;
}

/*
 * Find chapter cnum of book bnum, and display all its verses
 * 
 */
function readChapter(bnum, cnum) {
	// alert("readChapter" + ": book - " + bnum + ", chapter - " + cnum);

	var content = getContent(bnum, cnum, 0);
	var contentDoc = parent.content.document;
	contentDoc.getElementById("chapter_title").innerHTML = content.getChapter();
	contentDoc.getElementById("chapter_title_en").innerHTML = content.getChapterEn();
	contentDoc.getElementById("verses").innerHTML = content.getVerse();

	// Update the navigation
	if (bnum == FIRST_BOOK_NO && cnum == FIRST_CHAPTER_NO) {
		document.getElementById("last_chapter").innerHTML = "";
	} else {
		if (cnum == FIRST_CHAPTER_NO) {
			document.getElementById("last_chapter").innerHTML = "<a class='navigation_link' href='' onClick='readChapter(--g_currentBook,g_lastChapterOfLastBook); return false;'>"
					+ TO_LAST_CHAPTER + "</a>";
		} else {
			document.getElementById("last_chapter").innerHTML = "<a class='navigation_link' href='' onClick='readChapter(g_currentBook,--g_currentChapter); return false;'>"
					+ TO_LAST_CHAPTER + "</a>";
		}
	}
	
	var books = g_cuvXmlDoc.getElementsByTagName("BOOK");
	var current_chapters = books[bnum - 1].getElementsByTagName("CHAPTER");
	var last_chapters = books[books.length - 1].getElementsByTagName("CHAPTER");
	if (bnum == books.length && cnum == last_chapters.length) {
		document.getElementById("next_chapter").innerHTML = "";
	} else {
		if (cnum == current_chapters.length) {
			document.getElementById("next_chapter").innerHTML = "<a class='navigation_link' href='' onClick='readChapter(++g_currentBook,1); return false;'>"
					+ TO_NEXT_CHAPTER + "</a>";
		} else {
			document.getElementById("next_chapter").innerHTML = "<a class='navigation_link' href='' onClick='readChapter(g_currentBook,++g_currentChapter); return false;'>"
					+ TO_NEXT_CHAPTER + "</a>";
		}
	}

	g_currentBook = bnum;
	g_currentChapter = cnum;
	g_refreshPage = true;
}

/*
 * select_book: book no select_chapter_id: the ID of the SELECT element on the
 * page
 */

function setChapter(select_book, select_chapter_id) {
	// alert("select book: " + select_book + "; select chapter: " +
	// select_chapter_id);
	var book_no;
	var chapter_no;
	var chapters;
	var books = g_cuvXmlDoc.getElementsByTagName("BOOK");
	var select_chapter = document.getElementById(select_chapter_id);

	// Removes all existing options
	for (i = select_chapter.length - 1; i >= 0; i -= 1) {
		select_chapter.remove(i);
	}

	for (i = 0; i < books.length; i += 1) {
		book_no = books[i].getElementsByTagName("BOOK_NO")[0].childNodes[0].nodeValue;
		if (book_no == select_book) {
			chapters = books[i].getElementsByTagName("CHAPTER");
			for (j = 0; j < chapters.length; j += 1) {
				chapter_no = chapters[j].getElementsByTagName("CHAPTER_NO")[0].childNodes[0].nodeValue;
				try {
					select_chapter.add(new Option(getChapterOption(chapter_no),
							chapter_no), null) // add new option to end
				} catch (e) { // in IE, try the below version instead of add()
					select_chapter.add(new Option(getChapterOption(chapter_no),
							chapter_no)) // add new option to end of "sample"
				}
			}
			break;
		}
	}
}

/*
 * Set the book select element Parameters: 1. select_book_id: the ID of the
 * SELECT element on the page 2. p_testament: "OT" or "NT"
 */
function setBook(select_book_id) {
	// alert("select book: " + select_book_id + "; testament: " + p_testament);
	var book_no;
	var title;
	var books = g_cuvXmlDoc.getElementsByTagName("BOOK");
	var select_book = document.getElementById(select_book_id);

	// Removes all existing options
	for (i = select_book.length - 1; i >= 0; i -= 1) {
		select_book.remove(i);
	}
	for (i = 0; i < books.length; i += 1) {
		book_no = books[i].getElementsByTagName("BOOK_NO")[0].childNodes[0].nodeValue;
		title = books[i].getElementsByTagName("TITLE")[0].childNodes[0].nodeValue;
		try {
			// add new option to end
			select_book.add(new Option(title, book_no), null);
		} catch (e) { // in IE, try the below version instead of add()
			// add new option to end of "sample"
			select_book.add(new Option(title, book_no));
		}
	}
}

/*
 * Courtesy of http://www.codefans.net/jscss/code/687.shtml
 */
function hasChinese(text) {
	if (/.*[\u4e00-\u9fa5]+.*$/.test(text)) {
		return true;
	} else {
		alert(ALERT_INPUT_CHINESE);
		return false;
	}
}

function getResultSummary(version_name, text, count) {
	if (version_name == VERSION_CUV) {
		return SEARCH_RESULT_BAOHAN + "\"" + text + "\"" + SEARCH_RESULT_DEJINGWEN + count + VERSE_IN_CHINESE ;
	} else if (version_name == VERSION_BEV) {
		return "BEV contains \"" + text + "\" in: " + count + " verses";
	} else if (version_name == VERSION_NIV) {
		return "NIV contains \"" + text + "\" in: " + count + " verses";
	} else if (version_name == VERSION_KJV) {
		return "KJV contains \"" + text + "\" in: " + count + " verses";
	} else {
		alert(version + " not recognized");
		return "";
	}
}

function search4verses(version_name, text) {
	if (version_name == VERSION_CUV) {
		if (!hasChinese(text)) {
			return;
		}	
	} else {
		if (text.search(/\w/) == -1) {
			alert(ALERT_INPUT_ENGLISH);
			return;
		}
	}
	
	var book_no;
	var chapter_no;
	var verse_no;
	var verse;
	var abbr;

	var books;
	if (version_name == VERSION_CUV) {
		books = g_cuvXmlDoc.getElementsByTagName("BOOK");		
	} else if (version_name == VERSION_NIV) {
		setNiv(true);
		document.getElementById("checkbox_niv_id").checked = "checked";
		books = g_nivXmlDoc.getElementsByTagName("BOOK");
	} else if (version_name == VERSION_BEV) {
		setBev(true);
		document.getElementById("checkbox_bev_id").checked = "checked";
		books = g_bevXmlDoc.getElementsByTagName("BOOK");
	} else if (version_name == VERSION_KJV) {
		setKjv(true);
		document.getElementById("checkbox_kjv_id").checked = "checked";
		books = g_kjvXmlDoc.getElementsByTagName("BOOK");
	} else {
		alert("No such version: " + version_name);
		return;
	}
	
	var chapters;
	var verses;

	var html_verses = "<TABLE border='0' width='100%' cellspacing='5'>";
	var highlighted = "<span class = 'pattern'>" + text + "</span>";
	var count = 0;
	var pre_abbr = "";

	var i;
	for (i = 0; i < books.length; i += 1) {
		book_no = books[i].getElementsByTagName("BOOK_NO")[0].childNodes[0].nodeValue;
		chapters = books[i].getElementsByTagName("CHAPTER");
		abbr = books[i].getElementsByTagName("ABBR")[0].childNodes[0].nodeValue;

		for (j = 0; j < chapters.length; j += 1) {
			chapter_no = chapters[j].getElementsByTagName("CHAPTER_NO")[0].childNodes[0].nodeValue;

			verses = chapters[j].getElementsByTagName("VERSE");
			for (k = 0; k < verses.length; k += 1) {
				verse_no = verses[k].getElementsByTagName("VERSE_NO")[0].childNodes[0].nodeValue;
				try {
					verse = verses[k].getElementsByTagName("CONTENT")[0].childNodes[0].nodeValue;					
				} catch (e) {
					verse = "";
				}
				if (verse.search(text) != -1) {
					count += 1;
					verse = verse.replace(text, highlighted);
					if (abbr != pre_abbr) {
						pre_abbr = abbr;
					} else {
						abbr = "";
					}
					html_verses += "<tr><td class='abbr'><span class='abbr'>" + abbr +"</span></td>";
					html_verses += "<td class='index'>";
					html_verses += "<a class='navigation_link' href='' onClick='return popup_chapter(" +book_no+ ", " +chapter_no+ ", " +verse_no+ ")'>";
					html_verses += chapter_no + ":" + verse_no +"</a></td>";					
					html_verses += "<td>" + verse + "</td></tr>";
				}
			}
		}
	}
	html_verses += "</TABLE>";

	var contentDoc = parent.content.document;
	contentDoc.getElementById("chapter_title").innerHTML = getResultSummary(version_name, text, count);
	contentDoc.getElementById("chapter_title_en").innerHTML = "";
	contentDoc.getElementById("verses").innerHTML = html_verses;

	document.getElementById("last_chapter").innerHTML = "";
	document.getElementById("next_chapter").innerHTML = "";
	g_refreshPage = false;
	return;
}


function popup_chapter(pbook_no, pchapter_no, pverse_no) {
	var navDoc = parent.navigationFrame.document;
	if (navDoc.getElementById("checkbox_bev_id").checked) {
		g_bevOn = true;
		if (!g_bevXmlDoc) {
			loadBevXML();
		}
	} else {
		g_bevOn = false;
	}
	if (navDoc.getElementById("checkbox_kjv_id").checked) {
		g_kjvOn = true;
		if (!g_kjvXmlDoc) {
			loadKjvXML();
		}
	} else {
		g_kjvOn = false;
	}
	if (navDoc.getElementById("checkbox_niv_id").checked) {
		g_nivOn = true;
		if (!g_nivXmlDoc) {
			loadNivXML();
		}
	} else {
		g_nivOn = false;
	}
	var detail = getContent(pbook_no, pchapter_no, pverse_no);
	var html_chapter = "<h1><span id='chapter_title'>" + detail.getChapter() + "</span>";
	html_chapter += "<span class='title_en' id='chapter_title_en'>" + detail.getChapterEn() + "</span></h1>";
	var message = html_chapter + detail.getVerse();
	if (g_popupWindow != null && !g_popupWindow.closed) {
		g_popupWindow.close();
	}
	
	g_popupWindow = window.open("", null, "width=970,height=600,scrollbars=yes");
	// g_popupWindow.moveTo(250,50);
	var content = "<html><head><link rel='stylesheet' type='text/css' href='../css/style.css'/><title>" +
	detail.getChapter() + "</title></head><body>" +
	message + "</body></html>";

	g_popupWindow.document.write(content);
	g_popupWindow.document.close();//important to do this
	return false;
}

function showNote() {
	var noteWindow = window.open("notes.html", null, "width=650,height=400,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no");
	noteWindow.document.close();//important to do this
}