/**
 * Created by joshuakulas on 2/15/16.
 */

var allCourses = [];
var allArchitects = [];
var allRankings = [];
var publicationNames;
var fileName;
var inputRanking = {
    Publication : "",
    year : 0,
    type : "",
    courses : []
};
$(function(){
    $("#year").val(2016);
    // loads data
    datasets = [
        "Golf_2002_Public",
        "Golf_2003_All",
        "Golf_2004_Public",
        "Golf_2005_All",
        "Golf_2006_Public",
        "Golf_2007_All",
        "Golf_2008_Public",
        "Golf_2009_All",
        "Golf_2010_Public",
        'Golf_2011_All',
        "Golf_2012_Public",
        "Golf_2013_All",
        'Golf_2014_Public',
        "Golf_2015_All",
        "Golf_2016_Public",
        "GDigest_2001_All",
        "GDigest_2003_All",
        "GDigest_2005_All",
        "GDigest_2005_Public",
        "GDigest_2007_All",
        "GDigest_2007_Public",
        "GDigest_2009_Public",
        "GDigest_2009_All",
        "GDigest_2011_All",
        "GDigest_2013_All",
        "GDigest_2013_Public",
        "GDigest_2015_All",
        "GDigest_2015_Public",
        "GDigest_2017_All",
        "GDigest_2017_Public"
    ];
    // map of courses for all rankings
    courseMap = {};
    // map of architects for all rankings
    architectMap = {};
    // map of all rankings
    rankingsMap = {};
    index = 0;
    datasets.forEach(function(d) {
        $.getJSON("Rankings/" + d + ".json", function(json) {
            console.log("processing" + d);
            // array of architects for a given ranking
            architects = {};
            // array of courses for a given ranking
            courses = [];
            publication = {
                className : createClassName(json.Publication),
                displayName : json.Publication
            };
            ranking = {
                className : d,
                publication : publication,
                year : json.Year,
                type : json.Type,
                courses : [],
                architects : []
            };
            // populates courses
            // populates architects
            json.Courses.forEach(function(c) {
                // creates class name for given course c
                var className = createClassName(c.CourseName);
                // do if course is not in courseMap
                if (!courseMap.hasOwnProperty(className)) {
                    // array of architects for a given course
                    var tects = [];
                    // if there are two architects, create array containing both architects
                    if (c.Architect.indexOf("_") > -1) {
                        var archs = c.Architect.split("_");
                        archs.forEach(function(a) {
                            var arch;
                            // if the architect does not exist in architectMap, create it and push it
                            if (!architectMap.hasOwnProperty(createClassName(a))) {
                                arch = {
                                    displayName : a,
                                    className : createClassName(a),
                                    count : 1,
                                    courses : [],
                                    coarchitects : [],
                                    rankings : {}
                                };
                                architects[arch.className] = arch;
                            } else {
                                arch = architectMap[createClassName(a)];
                            }
                            if (!architects.hasOwnProperty(createClassName(a))) {
                            }
                            tects.push(arch);
                        });
                        // if only one architect for a given course
                    } else {
                        var a = c.Architect;
                        var arch;
                        // if architect doesn't exist in architectMap, create and push
                        if (!architectMap.hasOwnProperty(createClassName(a))) {
                            arch = {
                                displayName : a,
                                className : createClassName(a),
                                count : 0,
                                courses : [],
                                coarchitects : [],
                                rankings : {}
                            };
                            architectMap[createClassName(a)] = arch;
                        } else {
                            arch = architectMap[createClassName(a)];
                        }
                        // If architect is not in architects map, add
                        if (!architects.hasOwnProperty(createClassName(a))) {
                            architects[arch.className] = arch;
                        }
                        tects.push(arch);
                    }
                    // creates course object. Will need to be updated when more rankings are incorporated
                    var years;
                    if (typeof c.Year != 'string') {
                        years = String(c.Year);
                    } else {
                        years = c.Year;
                    }
                    if (years.indexOf("_") > -1) {
                        years = years.split("_");
                    } else {
                        years = [years]
                    }
                    if (typeof c.Coordinates === 'string') {
                        c.Coordinates = c.Coordinates.slice(1, c.Coordinates.length - 2);
                        c.Coordinates = c.Coordinates.split(",");
                    }
                    course = {
                        displayName : c.CourseName,
                        className : createClassName(c.CourseName),
                        yearCreated : years,
                        rankings : {},
                        state : c.State,
                        coordinates : c.Coordinates,
                        x : c.Coordinates[1],
                        y : c.Coordinates[0],
                        architects : tects,
                        type : c.Type
                    };
                    course.rankings[ranking.className] = ranking;

                    course.architects.forEach(function(a) {
                        a.courses.push(course);
                        a.count++;
                        if (!architects.hasOwnProperty(a.className)) {
                            architects[a.className] = a;
                        }
                    });
                } else {
                    course = courseMap[createClassName(c.CourseName)];
                }
                course.rankings[ranking.className] = {
                    ranking : ranking,
                    rank : c.Ranking
                };
                courses.push(course);
            });
            // adds courses to rankings
            courses.forEach(function(c) {
                ranking.courses.push(c);
            });
            // add architects to rankings
            for (var key in architects) {
                if (architects.hasOwnProperty(key)) {
                    arch = architects[key];
                    ranking.architects.push(arch);
                }
            }
            courses.forEach(function(c) {
                c.rankings[ranking.className].ranking = ranking;
                courseMap[c.className] = c;
            });

            for (var key in architects) {
                if (architects.hasOwnProperty(key)) {
                    architects[key].rankings[ranking.className] = ranking;
                    architectMap[key] = architects[key];
                }
            }
            rankingsMap[d] = ranking;

            index++;

            if (index === datasets.length) {
                console.log(courseMap);
                for (var key in courseMap) {
                    if (courseMap.hasOwnProperty(key)) {
                        allCourses.push(courseMap[key]);
                    }
                }
                for (var key in architectMap) {
                    if (architectMap.hasOwnProperty(key)) {
                        allArchitects.push(architectMap[key])
                    }
                }
                for (var key in rankingsMap) {
                    if (rankingsMap.hasOwnProperty(key)) {
                        allRankings.push(rankingsMap[key]);
                    }
                }
                var avlCoursesUl = $('#availableCourses').append($("<ul></ul>").addClass("availableCoursesList"));
                var coursesEnteredUl = $('#enteredCourses').append($("<ul></ul>").addClass("coursesEnteredList"));

                allCourses.sort(function(a,b) {
                    if (a.displayName < b.displayName) {
                        return -1;
                    } else {
                        return 1;
                    }
                });

                var avlCoursesSelect = d3.select("#availableCourses ul").selectAll('.avlCourses')
                    .data(allCourses, function(data, index) {return data.className + "-" + index});

                var avlCoursesEnter = avlCoursesSelect.enter().append('li')
                    .attr('class', function(d) {return 'avlCourse avlCourse-' + d.className;})
                    .text(function(d) {return d.displayName;});


                // make array of index objects to fill empty list
                var enteredIndexes = [];
                for (var i = 1; i < 101; i++){
                    arrVal = {
                        index : i
                    };
                    enteredIndexes.push(arrVal);
                }
                var enteredCoursesSelect = d3.select("#enteredCourses ul").selectAll('.entCourses')
                    .data(enteredIndexes, function(data, index) {return data.index});

                var enteredCoursesEnter = enteredCoursesSelect.enter().append('li')
                    .attr('class', function(d) {return 'entCourse entCourse-' + d.index;})
                    .text(function(d) {return d.index + ". "})
                var courseNames = allCourses.map(function(course) {
                    return course['displayName'];
                });
                var architectNames = allArchitects.map(function(architect) {
                    return architect['displayName'];
                });
                publicationNames = ["Golf Magazine", "Golf Digest"];


                /////////////////////////////////////////////
                ///////////// Initialize Listeners //////////
                /////////////////////////////////////////////
                $( "#courseName").autocomplete({
                    source: courseNames,
                    select: function(event, ui) {
                        course = allCourses.filter(function(c) {
                            return c.displayName === $("#courseName").val();
                        })[0];
                        $("#courseArchitect").val(course.architects[0].displayName);
                        $("#courseYear").val(course.yearCreated[0]);
                        $("#courseXCoordinate").val(course.x);
                        $("#courseYCoordinate").val(course.y);
                        $("#courseState").val(course.state);
                        $("#courseType").val(course.type);
                        $("#submitCourseInfo").focus();

                    }
                });
                $( "#courseArchitect").autocomplete({
                    source: architectNames
                });

                $( "#pubName").autocomplete({
                    source:publicationNames
                });
                $(".availableCoursesList").selectable({
                    selected: function(event,ui) {
                        if($('#courseRank').val().length < 1) {
                            alert("select a 'Entered Courses' value ");
                        } else {
                            var course = $(ui.selected.__data__)[0];
                            $("#courseName").val(course.displayName);
                            $("#courseArchitect").val(course.architects[0].displayName);
                            $("#courseYear").val(course.yearCreated[0]);
                            $("#courseState").val(course.state);
                            $("#courseXCoordinate").val(course.x);
                            $("#courseYCoordinate").val(course.y);
                            $("#courseType").val(course.type);
                            $("#submitCourseInfo").focus();
                        }
                    }
                });

                $(".coursesEnteredList").selectable({
                    selected: function(event, ui) {
                        $('#courseRank').val($(ui.selected.__data__)[0].index);
                    }
                })


            }
        });
    });
});


// called when the submit button is clicked
// will add course to ranking
// update Entered Courses list
function submitCourseInfo() {
    console.log("number of courses pre code");
    console.log(inputRanking.courses.length);
    inputRanking.courses.filter(function(course) {
        console.log(typeof course.Ranking);
        console.log(typeof $("#courseRank").val());
        console.log(course.Ranking !== $("#courseRank").val());
        return course.Ranking !== $("#courseRank").val();
    });
    console.log("number of courses post code");
    console.log(inputRanking.courses.length);
    if (inputRanking.publication == "") {
        alert("you must submit a ranking first");
    } else if ($("#courseName").val().length < 1) {
        alert("please enter a course name");
    } else if ($("#courseRank").val().length < 1) {
        alert("please enter a course ranking");
    } else if ($("#courseYear").val().length < 1) {
        alert("please enter a course year");
    } else if ($("#courseArchitect").val().length < 1) {
        alert("please enter a course architect");
    } else if ($("#courseXCoordinate").val().length < 1) {
        alert("please enter an x coordinate");
    } else if ($("#courseType").val().length < 1) {
        alert("please enter a course type");
    } else {
        var currentRank = $("#courseRank").val();
        var courseClassName = createClassName($("#courseName").val());
        var course = {
            CourseName : $("#courseName").val(),
            Ranking : $("#courseRank").val(),
            Architect : $("#courseArchitect").val(),
            Year : $("#courseYear").val(),
            Coordinates : [$("#courseXCoordinate").val(),
                $("#courseYCoordinate").val()],
            State : $("#courseState").val(),
            Type : $("#courseType").val()
        };
        console.log(d3.selectAll('.entCourse-' + $("#courseRank").val())
            .text(function(d) {
                return d.index + "  " + $("#courseName").val();
            }));
        var addCourse = true;
        // checks to see if a course with given rank already exists
        for (var courseIndex in inputRanking.courses) {
            if (inputRanking.courses[courseIndex].Ranking === $("#courseRank").val()) {
                addCourse = false;
                console.log("happened");
            }
        }
        if (addCourse) {
            inputRanking.courses.push(course);
            d3.selectAll(".avlCourse-" + courseClassName).classed("submittedCourse",true);
        }
        if (currentRank < 100) {
            $("#courseRank").val(parseInt(currentRank) + 1);
            $("#courseName").val("");
            $("#courseArchitect").val("");
            $("#courseYear").val("");
            $("#courseXCoordinate").val("");
            $("#courseYCoordinate").val("");
            $("#courseState").val("");
            $("#courseType").val("");
            $("#courseName").focus();

        }
    }
    console.log(inputRanking.courses);
}

// called when the submit button is clicked
// will add course to ranking
// update Entered Courses list
function submitRankingInfo() {
    if ($("#pubName").val().length < 1) {
        alert("please enter a publication");
    } else if (publicationNames.indexOf($("#pubName").val()) == -1) {
        alert("Not a valid publication name");
    } else if ($("#pubYear").val().length != 4) {
        alert("please enter a valid year");
    } else {
        inputRanking["Publication"] = $("#pubName").val();
        inputRanking['year'] = $("#pubYear").val();
        inputRanking['type'] = $("#pubType").val();
    }
    if ($("#pubName").val() === "Golf Magazine") {
        fileName = "Golf_" + $("#pubYear").val() + "_" + $("#pubType").val();
    } else {
        fileName = "GDigest_" + $("#pubYear").val() + "_" + $("#pubType").val();
    }
}
function rankingToText(ranking) {
    var outputArray = [];
    outputArray.push("{ \n");
    outputArray.push('"publication"' +":"+ '"' +  ranking.publication + '"'+ ",\n");
    outputArray.push('"Year"' + ":" + ranking.year + ",\n");
    outputArray.push('"Type"' + ":" + '"' + ranking.type + '"'+",\n");
    outputArray.push('"Courses"' + ":" + " [\n");
    for (var i in ranking.courses) {
        outputArray.push("{\n");
        outputArray.push('"CourseName"' + ":" +'"' + ranking.courses[i].CourseName + '"' + ",\n");
        outputArray.push('"Ranking"' + ":" + ranking.courses[i].Ranking + ",\n");
        outputArray.push('"State"' + ":" +'"' + ranking.courses[i].State + '"' + ",\n");
        outputArray.push('"Architect"' + ":" + '"' + ranking.courses[i].Architect +'"' + ",\n");
        outputArray.push('"Year"' + ":" + '"' + ranking.courses[i].Year + '"'+ ",\n");
        outputArray.push('"Coordinates"' + ":[" + ranking.courses[i].Coordinates[1] + "," + ranking.courses[i].Coordinates[0] + "],\n" );
        outputArray.push('"Type"' + ":" +'"' + ranking.courses[i].Type + '"' + "\n}\n" );
        if (i != ranking.courses.length  - 1){
            outputArray.push(",");
        }
        outputArray.push("\n");
    }
    outputArray.push("]}");
    return outputArray;


}




function finishRanking() {
    var outputArray = rankingToText(inputRanking);
    var blob = new Blob(outputArray, {type:"text/plain;charset=utf-8"});
    saveAs(blob, fileName + ".json");
}


// Function to create valid class name
// input cls: display name
// return: className
function createClassName(cls) {
    return cls.trim().replace(/\(|\)|\{|\}|\.|\"|\'/g,'').replace(/\s|\-/g,'_').toLowerCase();
}
