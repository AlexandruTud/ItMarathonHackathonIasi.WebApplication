import {
  getUserApplicationsInfo,
  getIfIsUserApp,
} from "../../services/user.js";
import {
  insertApplication,
  getApplications,
  getApplicationById,
  patchApplication,
  deleteApplication,
  getCards,
} from "../../services/applications.js";
import {
  insertEndpoint,
  getEndpoints,
  deleteEndpointRequest,
  getEndpointHistoryByHours,
  getEndpointHistoryById,
} from "../../services/endpoints.js";
import { register, login } from "../../services/auth.js";
import "../../interfaces/endpoint.js";
import "../../interfaces/generalStatistics.js";
import { Endpoint } from "../../interfaces/endpoint.js";
import { GeneralStatistics } from "../../interfaces/generalStatistics.js";

var authArea,
  logout,
  myApplicationsDashboard,
  notifications,
  history,
  information,
  logout2,
  myApplicationsDashboard2,
  notifications2,
  history2,
  information2;
var sidebar, closeBtn;
var homeSection,
  commentsSection,
  historySection,
  settingsSection,
  myApplications,
  addPopup,
  endpointSection;
var cards, myApplicationsCards;

var applicationTitle,
  applicationDescription,
  applicationImage,
  addApplicationBtn;

var currentApplicationId, currentEndpointId, currentReportId;
var endpointsWrapper;
var endpointUrl, endpointType;
var getEndpoint, postEndpoint, putEndpoint, patchEndpoint, deleteEndpoint;
var endpointStatisticsHours, endpointStatisticsUnit;

var totalProjects,
  totalEndpoints,
  endpointsStable,
  endpointsUnstable,
  endpointsDown;

var personalStatsEmail,
  totalProjectsLabel,
  totalEndpointsLabel,
  endpointsStableLabel,
  endpointsUnstableLabel,
  endpointsDownLabel;

var notification, notificationWrapper, notificationBadge;

function updatePersonalStatistics() {
  totalProjectsLabel.text(totalProjects);
  totalEndpointsLabel.text(totalEndpoints);
  endpointsStableLabel.text(endpointsStable);
  endpointsUnstableLabel.text(endpointsUnstable);
  endpointsDownLabel.text(endpointsDown);
}

// Endpoints charts
var endpointChart;
var endpointChartX = ["Successful calls", "Unsuccessful calls"];
var endpointChartY = [0, 0];
var endpointChartBarColors = ["#00aba9", "#b91d47"];

// General statistics
var generalStatistics = new GeneralStatistics(0, 0, 0, 0);
var totalApplicationsLabel,
  totalEndpointsGeneralLabel,
  totalUsersLabel,
  totalEndpointCallsLabel;

var generalEndpoints, configGeneralEndpoints, generalEndpointsChart;
var generalReports, configGeneralReports, generalReportsChart;

var reportMentions;




function checkLoginStatus() {
  var userId = $.cookie("UserId");

  if (userId !== undefined) {
    authArea.attr("hidden", true);
    getUserApplicationsInfo(parseInt(userId)).done(function (data) {
      personalStatsEmail.text(data[0].email);
      totalProjects = data[0].nrOfApplications;
      totalEndpoints = data[0].nrOfEndpoints;
      endpointsStable = data[0].nrOfEndpointsStable;
      endpointsUnstable = data[0].nrOfEndpointsUnstable;
      endpointsDown = data[0].nrOfEndpointsDown;
      updatePersonalStatistics();
    });
  } else {
    notifications.attr("hidden", true);
    history.attr("hidden", true);
    information.attr("hidden", true);
    notifications2.attr("hidden", true);
    history2.attr("hidden", true);
    information2.attr("hidden", true);
  }

}







function onLogout() {
  document.cookie = "UserId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "http://localhost:5500/templates/auth/login.html";
}

function loadCards() {
  getApplications()
    .done(function (data) {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        addCard(data[i]);
      }

      if (idUserAuthor == 0) $("#card").attr("hidden", true);
      else $("#myApplicationsCard").attr("hidden", true);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
      if (idUserAuthor == 0) $("#card").remove();
      else $("#myApplicationsCard").remove();
    });
}



function convertTypeStrToInt(typeStr) {
  if (typeStr === "GET") return 1;
  else if (typeStr === "POST") return 2;
  else if (typeStr === "PUT") return 3;
  else if (typeStr === "PATCH") return 4;
  else if (typeStr === "DELETE") return 5;
  else return 0;
}

function loadEndpoints(idApplication, ownApplication) {
  getEndpoints(idApplication).done(function (data) {
    endpointsWrapper.empty();

    for (let i = 0; i < data.length; i++)
      addEndpointCard(
        data[i].idEndpoint,
        new Endpoint(
          data[i].url,
          convertTypeStrToInt(data[i].type),
          idApplication,
          data[i].dateCreated
            .replace("T", " ")
            .substring(0, data[i].dateCreated.indexOf(".")),
          data[i].endpointState
        ),
        ownApplication
      );
  });
}

async function onFilterEndpoints(event) {
  var filter = event.target.value;

  endpointsWrapper.children().each(function (index, card) {
    var text = $(card)
      .children()
      .eq(1)
      .children()
      .eq(0)
      .children()
      .eq(1)
      .children()
      .eq(0)
      .text();

    if (text === "Stable" && (filter == 2 || filter == 3)) {
      $(card).hide();
    } else if (text === "Unstable" && (filter == 1 || filter == 3)) {
      $(card).hide();
    } else if (text === "Down" && (filter == 1 || filter == 2)) {
      $(card).hide();
    } else {
      $(card).show();
    }
  });
}

async function addEndpoint() {
  var url = $("#endpointUrl").val();
  var idType = parseInt($("#endpointType").val());

  if (url < 3) {
    alert("Type a valid url for the endpoint!");
    return;
  }

  var endpoint = new Endpoint(url, idType, currentApplicationId, null);

  insertEndpoint({
    url: endpoint.url,
    idType: endpoint.idType,
    idApplication: endpoint.idApplication,
  })
    .done(function (data) {
      addEndpointCard(data, endpoint, true);

      $("#endpointUrl").val("");

      totalEndpoints++;
      endpointsStable++;
      updatePersonalStatistics();
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    });
}

async function cancelEndpointStatisticsModal() {
  $("#viewStatisticsChoice").hide();
  endpointStatisticsHours.val("");
  endpointStatisticsUnit.val("1");
  $("#viewStatistics").hide();
}

function countEndpointCalls(data) {
  var successful = 0,
    unsuccessful = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].code == 200 || data[i].code == 302) successful++;
    else unsuccessful++;
  }

  return [successful, unsuccessful];
}

async function showEndpointStatistics() {
  if ($("#endpointStatisticsHours").val() === "") {
    alert("Insert a valid number for hours!");
    return;
  }

  var hours = parseInt($("#endpointStatisticsHours").val());

  var unit = parseInt($("#endpointStatisticsUnit").val());
  if (unit == 2) hours *= 24;

  getEndpointHistoryByHours(currentEndpointId, hours).done(function (data) {
    if (data.length == 0) {
      alert("There is no data to be shown in the interval selected!");
    } else {
      var count = countEndpointCalls(data);

      endpointChartY = count;

      if (endpointChart != null) endpointChart.destroy();

      endpointChart = new Chart("myChart", {
        type: "pie",
        data: {
          labels: endpointChartX,
          datasets: [
            {
              backgroundColor: endpointChartBarColors,
              data: endpointChartY,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: "Statistics",
          },
        },
      });

      var ok = 0,
        notOk = 0;

      for (let i = 0; i < data.length; i++) {
        if (data[i].code == 200 || data[i].code == 302) ok++;
        else notOk++;

        if (ok > 0 && notOk > 0) break;
      }

      if (notOk == 0) {
        $("#endpointStatisticsState").css("background", "green");
        $("#endpointStatisticsState").text("Stable");
      } else if (ok == 0) {
        $("#endpointStatisticsState").css("background", "red");
        $("#endpointStatisticsState").text("Down");
      }

      $("#viewStatisticsChoice").hide();
      $("#viewStatistics").show();
    }
  });
}

async function showReportModal() {
  $("#reportPopup").show();
}

async function cancelReportModal() {
  $("#reportPopup").hide();
}

async function addReport() {
  if ($("#reportMentions").val().length < 3) {
    alert("Insert a valid comment!");
    return;
  }

  var idUser = $.cookie("UserId");
  if (idUser === undefined) idUser = null;

  insertReport({
    idApplication: currentApplicationId,
    idEndpoint: currentEndpointId,
    idUser: idUser,
    mentions: $("#reportMentions").val(),
  }).done(function () {
    patchApplication({
      idApplication: currentApplicationId,
      idState: 2,
    }).done(function () {
      $("#endpoint" + currentEndpointId)
        .children()
        .eq(1)
        .children()
        .eq(0)
        .children()
        .eq(1)
        .css("background", "rgb(152, 152, 0)");

      $("#endpoint" + currentEndpointId)
        .children()
        .eq(1)
        .children()
        .eq(0)
        .children()
        .eq(1)
        .children()
        .eq(0)
        .text("Unstable");

      $("#reportMentions").val("");
    });
  });
}

async function updateGeneralStatistics() {
  totalApplicationsLabel.text(generalStatistics.totalApplications);
  totalEndpointsGeneralLabel.text(generalStatistics.totalEndpoints);
  totalUsersLabel.text(generalStatistics.totalUsers);
  totalEndpointCallsLabel.text(generalStatistics.totalEndpointCalls);

  generalEndpoints.datasets[0].data = [
    generalStatistics.stableEndpoints,
    generalStatistics.unstableEndpoints,
    generalStatistics.downEndpoints,
  ];

  generalReports.datasets[0].data = [
    generalStatistics.solvedReports,
    generalStatistics.unsolvedReports,
  ];

  if (generalEndpointsChart != null) generalEndpointsChart.destroy();

  generalEndpointsChart = new Chart(
    document.getElementById("myChartFirst"),
    configGeneralEndpoints
  );

  if (generalReportsChart != null) generalReportsChart.destroy();

  generalReportsChart = new Chart(
    document.getElementById("myChartSecond"),
    configGeneralReports
  );
}




async function onDeleteEndpoint() {
  deleteEndpointRequest(currentEndpointId).done(function () {
    $("#myApplicationsEndpoint" + currentEndpointId).remove();
    cancelDeleteEndpointModal();
    currentEndpointId = 0;
  });
}


async function searchMyApplicationsCards(event) {
  var text = event.target.value;
  myApplicationsCards.children().each(function (index, card) {
    if (
      !$(card)
        .children()
        .eq(2)
        .children()
        .eq(0)
        .text()
        .toLowerCase()
        .includes(text.toLowerCase()) &&
      !$(card)
        .children()
        .eq(2)
        .children()
        .eq(1)
        .text()
        .toLowerCase()
        .includes(text.toLowerCase())
    ) {
      if ($(card).attr("id") !== "myApplicationscard") {
        $(card).attr("hidden", true);
      }
    } else {
      if ($(card).attr("id") !== "myApplicationsCard") {
        $(card).attr("hidden", false);
      }
    }
  });
}

async function switchTabs(tab) {
  var tabToDeselect = $($(".profile")[0]);

  tabToDeselect.removeClass("profile");

  if (tabToDeselect.children().length > 2) {
    tabToDeselect.children().eq(1).css("color", "");
    tabToDeselect.children().eq(2).css("color", "#4516ac");
  } else {
    tabToDeselect.children().eq(0).css("color", "");
    tabToDeselect.children().eq(1).css("color", "#4516ac");
  }

  tab.addClass("profile");

  if (tab.children().length > 2) {
    tab.children().eq(1).css("color", "white");
    tab.children().eq(2).css("color", "white");
  } else {
    tab.children().eq(0).css("color", "white");
    tab.children().eq(1).css("color", "white");
  }
}

async function loadHomeSection() {
  try {
    //const response = await fetch("home-section.html");
    if (response.ok) {
      const content = await response.text();
      homeSection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function loadCommentsSection() {
  try {
    //const response = await fetch("comments-section.html");
    if (response.ok) {
      const content = await response.text();
      commentsSection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function loadHistorySection() {
  try {
    //const response = await fetch("history-section.html");
    if (response.ok) {
      const content = await response.text();
      historySection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function loadSettingsSection() {
  try {
    //const response = await fetch("settings-section.html");
    if (response.ok) {
      const content = await response.text();
      settingsSection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function loadMyApplications() {
  try {
    //const response = await fetch("myapps.html");
    if (response.ok) {
      const content = await response.text();
      settingsSection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function loadEndpoint() {
  try {
    //const response = await fetch("myapps.html");
    if (response.ok) {
      const content = await response.text();
      settingsSection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function closeApplicationModal() {
  $("#myModal").hide();
}

async function closeEndpointModal() {
  $("#addEndpointModal").hide();
}

async function deleteEndpointModal() {
  $("#myModal2").show();
}

async function cancelDeleteEndpointModal() {
  $("#myModal2").hide();
}

async function showHistory() {
  $("#viewHistoryPopup").show();
}

async function cancelHistory() {
  $("#viewHistoryPopup").hide();
}

function menuBtnChange() {
  if (sidebar.hasClass("open")) {
    closeBtn.removeClass("bx-menu").addClass("bx-menu-alt-right");
  } else {
    closeBtn.removeClass("bx-menu-alt-right").addClass("bx-menu");
  }
}


$(document).ready(function () {



  authArea = $("#authArea");
  logout = $("#logout");
  myApplicationsDashboard = $("#myApplications");
  notifications = $("#notifications");
  history = $("#history");
  information = $("#information");

  logout2 = $("#log_out_back2");
  myApplicationsDashboard2 = $("#apps-navbar");
  notifications2 = $("#comments-navbar");
  history2 = $("#history-navbar");
  information2 = $("#information-navbar");

  cards = $("#cards");
  myApplicationsCards = $("#myApplicationsCards");

  applicationTitle = $("#applicationTitle");
  applicationDescription = $("#applicationDescription");
  applicationImage = $("#applicationImage");
  addApplicationBtn = $("#addApplicationBtn");
  addApplicationBtn.click(function () {
    if (applicationTitle.val().length < 3) {
      alert("Type a valid application title!");
      return;
    }

    if (applicationDescription.val().length < 3) {
      alert("Type a valid application description!");
      return;
    }

    if (applicationImage.val() === "") {
      alert("Please insert an image for your application!");
      return;
    }

    var imagePath = applicationImage
      .val()
      .substring(applicationImage.val().lastIndexOf("\\") + 1);

    insertApplication({
      name: applicationTitle.val(),
      description: applicationDescription.val(),
      idUserAuthor: parseInt($.cookie("UserId")),
      image: imagePath,
    }).done(function (data) {
      var idApplication = data;
      getApplicationById(data).done(function (data) {
        addCard(parseInt($.cookie("UserId")), {
          idApplication: idApplication,
          name: data[0].name,
          description: data[0].description,
          dateCreated: data[0].dateCreated,
          applicationState: data[0].applicationState,
          image: data[0].image,
        });

        applicationTitle.val("");
        applicationDescription.val("");

        $("#addSendModal").hide();

        totalProjects++;
        updatePersonalStatistics();
      });
    });
  });

  endpointUrl = $("#endpointUrl");
  endpointType = $("#endpointType");
  endpointsWrapper = $("#endpointsWrapper");
  getEndpoint = $("#getEndpoint");
  postEndpoint = $("#postEndpoint");
  putEndpoint = $("#putEndpoint");
  patchEndpoint = $("#patchEndpoint");
  deleteEndpoint = $("#deleteEndpoint");

  personalStatsEmail = $("#personalStatsEmail");
  totalProjectsLabel = $("#totalProjectsLabel");
  totalEndpointsLabel = $("#totalEndpointsLabel");
  endpointsStableLabel = $("#endpointsStableLabel");
  endpointsUnstableLabel = $("#endpointsUnstableLabel");
  endpointsDownLabel = $("#endpointsDownLabel");

  (endpointStatisticsHours = $("#endpointStatisticsHours")),
    (endpointStatisticsUnit = $("#endpointStatisticsUnit"));

  (totalApplicationsLabel = $("#totalApplicationsLabel")),
    (totalEndpointsGeneralLabel = $("#totalEndpointsGeneralLabel"));
  (totalUsersLabel = $("#totalUsersLabel")),
    (totalEndpointCallsLabel = $("#totalEndpointCallsLabel"));

  reportMentions = $("#reportMentions");

  notification = $("#notification");
  notificationWrapper = $("#notificationWrapper");
  notificationBadge = $("#notificationBadge");


  checkLoginStatus();
  loadCards(0);

  var userId = $.cookie("UserId");
  if (userId !== undefined) {
    loadCards(parseInt(userId));
  }

  sidebar = $(".sidebar");
  closeBtn = $("#btn");

  closeBtn.click(function () {
    sidebar.toggleClass("open");
    menuBtnChange();
  });

  logout.click(function () {
    onLogout();
  });

  homeSection = $(".home-section");
  commentsSection = $(".comments-section");
  historySection = $(".history-section");
  settingsSection = $(".settings-section");
  myApplications = $(".myapp-section");
  addPopup = $(".popup-container10");
  endpointSection = $(".editEndpoints");

  commentsSection.hide();
  historySection.hide();
  settingsSection.hide();
  myApplications.hide();
  endpointSection.hide();

  loadHomeSection();

  $("#dash").click(function () {
    switchTabs($("#dash"));

    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadHomeSection();
    homeSection.show();
  });

  $("#notifications").click(function () {
    switchTabs($("#notifications"));

    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadCommentsSection();
    commentsSection.show();
  });

  $("#history").click(function () {
    switchTabs($("#history"));

    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadHistorySection();
    historySection.show();
  });

  $("#settings").click(function () {
    switchTabs($("#settings"));

    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadSettingsSection();
    settingsSection.show();
  });

  $("#myApplications").click(function () {
    switchTabs($("#myApplications"));

    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    endpointSection.hide();

    loadMyApplications();
    myApplications.show();
  });

  commentsSection.hide();
  historySection.hide();
  settingsSection.hide();
  myApplications.hide();

  $("#dash-navbar").click(function () {
    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadHomeSection();
    homeSection.show();
  });

  $("#comments-navbar").click(function () {
    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadCommentsSection();
    commentsSection.show();
  });

  $("#history-navbar").click(function () {
    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadHistorySection();
    historySection.show();
  });

  $("#settings-navbar").click(function () {
    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadSettingsSection();
    settingsSection.show();
  });

  $("#apps-navbar").click(function () {
    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    endpointSection.hide();

    loadMyApplications();
    myApplications.show();
  });

  $("#information-navbar").click(function () {
    $("#viewProfile").show();
  });

  $("#addSend").click(function () {
    $("#addSendModal").show();
  });

  $("#addLei").click(function () {
    $("#addLeiModal").show();
  });

  $("#buyCoin").click(function () {
    $("#buyCoinPopup").show();
  });

  $("#sellCoin").click(function () {
    $("#sellCoinPopup").show();
  });

  $("#closeSellCoin").click(function () {
    $("#sellCoinPopup").hide();
  });

  $("#closeBuy").click(function () {
    $("#buyCoinPopup").hide();
  });

  $("#closeButtonLei").click(function () {
    $("#addLeiModal").hide();
  });

  $("#retrageLei").click(function () {
    $("#retrageLeiModal").show();
  });

  $("#closeButtonLei2").click(function () {
    $("#retrageLeiModal").hide();
  });


  $("#closeButton2").click(function () {
    $("#addSendModal").hide();
  });

  $("#addEndpoint").click(function () {
    $("#addEndpointModal").show();
  });

  $("#viewStatistics").click(function () {
    $("#viewStatisticsChoice").show();
  });

  $("#information").click(function () {
    $("#viewProfile").show();
  });

  $("#closeButtonProfile").click(function () {
    $("#viewProfile").hide();
  });

  generalEndpoints = {
    labels: ["Stable", "Unstable", "Down"],
    datasets: [
      {
        label: "Endpoints",
        data: [0, 0, 0],
        backgroundColor: ["#28a745", "#ffc107", "#dc3545"], // Verde, Galben, Roșu
        borderColor: ["#28a745", "#ffc107", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  configGeneralEndpoints = {
    type: "pie",
    data: generalEndpoints,

    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "white",
          },
        },
        title: {
          display: true,
          text: "Total Endpoints",
          color: "#ffffff",
          font: {
            size: 20,
          },
        },
      },
    },
  };

  generalReports = {
    labels: ["Solved", "Unsolved"],
    datasets: [
      {
        label: "Reports",
        data: [30, 50],
        backgroundColor: ["#28a745", "#dc3545"], // Verde, Roșu
        borderColor: ["#28a745", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  configGeneralReports = {
    type: "doughnut",
    data: generalReports,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "white",
          },
        },
        title: {
          display: true,
          text: "Total Reports",
          color: "#ffffff",
          font: {
            size: 20,
          },
        },
      },
    },
  };


});

window.searchCards = searchCards;
window.addEndpoint = addEndpoint;
window.closeEndpointModal = closeEndpointModal;
window.closeApplicationModal = closeApplicationModal;
window.deleteCard = deleteCard;
window.deleteEndpointModal = deleteEndpointModal;
window.cancelDeleteEndpointModal = cancelDeleteEndpointModal;
window.onDeleteEndpoint = onDeleteEndpoint;
window.showEndpointStatistics = showEndpointStatistics;
window.cancelEndpointStatisticsModal = cancelEndpointStatisticsModal;
window.searchMyApplicationsCards = searchMyApplicationsCards;
window.showReportModal = showReportModal;
window.cancelReportModal = cancelReportModal;
window.addReport = addReport;
window.onFilterEndpoints = onFilterEndpoints;
window.showHistory = showHistory;
window.cancelHistory = cancelHistory;
