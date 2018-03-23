(function() {
  this.App = Ember.Application.create();

  Config.url = "http://" + Config.host;

  App.Router.map(function() {
    this.route("game");
    this.route("stats");
    return this.route("redirect", {
      path: "*path"
    });
  });

  App.IndexRoute = Ember.Route.extend();

  App.RedirectRoute = Ember.Route.extend({
    afterModel: function() {
      return this.transitionTo("index");
    }
  });

  App.GameRoute = Ember.Route.extend({
    setupController: function(controller) {
      return controller.load();
    },
    renderTemplate: function() {
      return this.render("game");
    }
  });

  App.StatsRoute = Ember.Route.extend({
    model: function() {
      return Ember.$.getJSON("/stats");
    },
    renderTemplate: function() {
      return this.render("stats");
    }
  });

  App.ApplicationController = Ember.Controller.extend({
    routeChanged: (function() {
      var self;
      if (!ga) {
        return;
      }
      self = this;
      return Em.run.next(function() {
        ga("send", "pageview", "/" + (self.get("currentPath")));
        return Config.reload();
      });
    }).observes("currentPath")
  });

  App.IndexController = Ember.ObjectController.extend($.extend({
    needs: "game",
    isLoading: false,
    actions: {
      play: function() {
        var self;
        self = this;
        self.set("isLoading", true);
        return $.post("/game").always(function() {
          return self.set("isLoading", false);
        }).done(function(data) {
          var controller;
          controller = self.get("controllers.game");
          controller.set("response", data);
          return self.transitionToRoute("game");
        }).fail(function(xhr, status, error) {
          return alert("Error " + xhr.status + ": " + xhr.statusText + ". Try refreshing a page");
        });
      }
    }
  }, Config));

  App.GameController = Ember.ObjectController.extend($.extend({
    isLoading: false,
    response: null,
    correct: null,
    waitResponse: null,
    game: (function() {
      if (this.get("waitResponse")) {
        return this.get("waitResponse").game;
      }
      if (this.get("response")) {
        return this.get("response").game;
      }
      return {};
    }).property("response", "waitResponse"),
    isLive: (function() {
      if (this.get("waitResponse") && this.get("waitResponse").game.lives === 0) {
        return false;
      }
      if (this.get("response") && this.get("response").game.lives === 0) {
        return false;
      }
      return true;
    }).property("response", "waitResponse"),
    hasSurvived: (function() {
      if (!this.get("response")) {
        return false;
      }
      return this.get("response").status === "survived";
    }).property("response"),
    highlightedSnippet: (function() {
      var snippet;
      if (!this.get("response")) {
        return "";
      }
      snippet = this.get("response").variant.snippet;
      return $("<div />").html(hljs.highlightAuto(snippet).value).html();
    }).property("response"),
    load: function() {
      var self;
      self = this;
      self.set("isLoading", true);
      return $.get("/game").always(function() {
        return self.set("isLoading", false);
      }).done(function(data) {
        if (data.error) {
          return self.transitionToRoute("index");
        } else {
          return self.set("response", data);
        }
      }).fail(function(xhr, status, error) {
        return alert("Error " + xhr.status + ": " + xhr.statusText + ". Try refreshing a page");
      });
    },
    result: function(data) {
      ga("send", "pageview", "/game");
      if (data.correct) {
        this.set("correct", data.correct);
        return this.set("waitResponse", data);
      } else {
        return this.set("response", data);
      }
    },
    actions: {
      choose: function(option) {
        var self;
        self = this;
        self.set("isLoading", true);
        return $.ajax({
          url: "/game",
          type: "PUT",
          data: {
            option: option
          }
        }).always(function() {
          return self.set("isLoading", false);
        }).done(function(data) {
          if (data.error) {
            return alert(data.error);
          } else {
            return self.result(data);
          }
        }).fail(function(xhr, status, error) {
          return alert("Error " + xhr.status + ": " + xhr.statusText + ". Try refreshing a page");
        });
      },
      next: function() {
        this.set("response", this.get("waitResponse"));
        this.set("correct", null);
        return this.set("waitResponse", null);
      }
    }
  }, Config));

  App.StatsController = Ember.ObjectController.extend(Config);

}).call(this);
