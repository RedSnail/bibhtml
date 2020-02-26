'use strict';
function parseMeta(id, title) {
    var properties = title.split("&"), entries = properties.map(x => x.split("="));
    entries.push(["id", id])
    var ret = Object.fromEntries(entries);
    return ret;
}

function mapMeta(meta, refs) {
    for(var i = 0; i < meta.length; i += 1) {
        var item_title = decodeURIComponent(meta[i].getAttribute("title"));
        refs.push(parseMeta(meta[i].getAttribute("id"), item_title));
    } // parse coin metadata
    
    return refs;
}

function writeCitations(all, ref) {
    var ret = false;
    for(var i = 0; i < all.length; i += 1) {
        if(all[i].getAttribute("data-cites") == ref["id"]) {
            ret = true;
            var link = document.createElement("a");
            link.setAttribute("href", "#" + ref["id"]);
            link.innerHTML = ref["alias"];
            all[i].appendChild(link);
            all[i].style.backgroundColor = "orange";
        }
    }
    return ret;
}


function checkDecent(metadata, present, index, full) {
    if(present) {
        var p = document.createElement("p");
        p.innerHTML= full;
        metadata[index[0]].appendChild(p);
        index[1] += 1;
    } else {
        metadata[index[0]].parentNode.removeChild(metadata[index[0]]);
    }
}

/*function changeLayout(metadata, citations) {
    // Object.entries(refs[1]).forEach(function(x) {alert(x[0] + " " + x[1])});
    var refs = [];
    mapMeta(metadata, refs);
    for(var index = [0, 1]; index[0] < refs.length; index[0] += 1) {
        var alias = refs[index[0]]["rft.aulast"] + ", " + refs[index[0]]["rft.date"];
        var full = "[" + index[1] + "] " + 
            refs[index[0]]["rft.au"] + 
            ". " + refs[index[0]]["rft.atitle"] +
            ". " + refs[index[0]]["rft.jtitle"] +
            ". " + refs[index[0]]["rft.pages"] + 
            ". " + refs[index[0]]["rft.date"] + ".";
        
        var present = writeCitations(citations, refs[index[0]]["id"], "(" + alias + ")");
        checkDecent(metadata, present, index, full);
    }
}*/

function fulfill(div, refs) {
    var ul = document.createElement("ul");
    div.appendChild(ul);
    refs.forEach(function(x) {
        if (x["present"]) {
            var li = document.createElement("li");
            li.setAttribute("id", x["id"]);
            li.setAttribute("class", "bibitem");
            ul.appendChild(li);
            
            var a = document.createElement("a");
            a.innerHTML = x["full"];
            a.setAttribute("href", x["url"]);
            
            li.appendChild(a);
        }
    });
}

function changeLayout(refs, citations) {
    // Object.entries(refs[1]).forEach(function(x) {alert(x[0] + " " + x[1])});
    for(var index = [0, 1]; index[0] < refs.length; index[0] += 1) {
        refs[index[0]]["alias"] = "(" + refs[index[0]]["author"].split(" and ").join(", ").split(", ")[0] +
            ", " + refs[index[0]]["year"] + ")";
        refs[index[0]]["full"] = "[" + index[1] + "] " + 
            refs[index[0]]["author"] + 
            ". " + refs[index[0]]["title"] +
            ". " + refs[index[0]]["journal"] +
            ". " + refs[index[0]]["pages"] + 
            ". " + refs[index[0]]["year"] + ".";
        
        refs[index[0]]["present"] = writeCitations(citations, refs[index[0]]);
        
        if(refs[index[0]]["present"]) {
            index[1] += 1;
        }
        // checkDecent(metadata, present, index, full);
    }
    
    fulfill(document.getElementById("bibliography"), refs);
    
}

function getBibs(links, bib_paths) {
    for (var i = 0; i < links.length; i += 1) {
        if (links[i].hasAttribute("type")) {
            if (links[i].getAttribute("type") == "text/bib") {
                if (links[i].hasAttribute("href")) {
                    bib_paths.push(links[i].getAttribute("href"));
                }
            }
           
        }
    }
    
}

function trim(str) {
    str = str.trimLeft(' "{' + "'");
    return str.trimRight(' "}' + "'");
}

function getMetadata(bib_paths) {
    var refs = [];
    bib_paths.forEach(function(path) { 
        var request = new XMLHttpRequest();
        request.open('GET', path, false);  // `false` makes the request synchronous
        request.send(null);
        var text = "";
        
        if(request.status == 200) {
            text = request.responseText;
        }
        
        var json = bibtexParse.toJSON(text);
        json.forEach(function(x) {
            var bundle = x["entryTags"]
            bundle["id"] = x["citationKey"]
            refs.push(bundle);
        });
    });
    
    return refs;
}

function setListener(item, master) {
    item.addEventListener("click", function(e) {
        master.setAttribute("class", "animated");
    });
    
    master.addEventListener("animationend", function(e) {
        master.setAttribute("class", "")
    });
}

document.addEventListener("DOMContentLoaded", function (event) { 
    //var metadata = document.getElementsByClassName("Z3988"); //retrieving coins metadata
    var citations = document.getElementsByClassName("citation"); //retrieving citations
            
    var links = document.querySelectorAll("link");
    var bib_paths = [];
    getBibs(links, bib_paths);
    var refs = getMetadata(bib_paths, refs);
    
    changeLayout(refs, citations);
    
    for(var i = 0; i < citations.length; i += 1) {
        const master_id = citations[i].getAttribute("data-cites");
        var master = document.getElementById(master_id);
        setListener(citations[i], master);
    }
});

