const serverUrl = "https://localhost:7115/api";

export function insertApplication(payload) {
  var deferred = $.Deferred();

  $.ajax({
    url: serverUrl + "/AddApplication",
    type: "POST",
    data: JSON.stringify(payload),
    contentType: "application/json",
    success: function (data) {
      deferred.resolve(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      deferred.reject(jqXHR, textStatus, errorThrown);
    },
  });

  return deferred.promise();
}

export function getApplicationById(idApplication) {
  var deferred = $.Deferred();

  $.ajax({
    url: serverUrl + "/GetApplicationById?idApplication=" + idApplication,
    type: "GET",
    contentType: "application/json",
    success: function (data) {
      deferred.resolve(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      deferred.reject(jqXHR, textStatus, errorThrown);
    },
  });

  return deferred.promise();
}

export function getApplications() {
  var deferred = $.Deferred();

  $.ajax({
    url: serverUrl + "/Currency/Get_currency",
    type: "GET",
    contentType: "application/json",
    success: function (data) {
      deferred.resolve(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      deferred.reject(jqXHR, textStatus, errorThrown);
    },
  });

  return deferred.promise();
}

export function patchApplication(payload) {
  var deferred = $.Deferred();

  $.ajax({
    url: serverUrl + "/UpdateApplication",
    type: "PATCH",
    data: JSON.stringify(payload),
    contentType: "application/json",
    success: function (data) {
      deferred.resolve(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      deferred.reject(jqXHR, textStatus, errorThrown);
    },
  });

  return deferred.promise();
}

export function deleteApplication(idApplication) {
  var deferred = $.Deferred();

  $.ajax({
    url: serverUrl + "/DeleteApplication?idApplication=" + idApplication,
    type: "DELETE",
    contentType: "application/json",
    success: function (data) {
      deferred.resolve(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      deferred.reject(jqXHR, textStatus, errorThrown);
    },
  });

  return deferred.promise();
}


export function getCards() {
  var deferred = $.Deferred();

  $.ajax({
    url: serverUrl + "/Currency/Get_currency",
    type: "GET",
    contentType: "application/json",
    success: function (data) {
      deferred.resolve(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      deferred.reject(jqXHR, textStatus, errorThrown);
    },
  });

  return deferred.promise();
}