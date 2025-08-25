// TweenLite core (simplified version for particle animation)
      var TweenLite = {
        to: function(target, duration, vars) {
          return new Tween(target, duration, vars);
        }
      };

      function Tween(target, duration, vars) {
        this.target = target;
        this.duration = duration * 1000;
        this.vars = vars || {};
        this.startTime = Date.now();
        this.startValues = {};
        this.endValues = {};
        
        for (var prop in vars) {
          if (prop !== 'ease' && prop !== 'onComplete') {
            this.startValues[prop] = target[prop];
            this.endValues[prop] = vars[prop];
          }
        }
        
        this.animate();
      }

      Tween.prototype.animate = function() {
        var self = this;
        var currentTime = Date.now();
        var elapsed = currentTime - this.startTime;
        var progress = Math.min(elapsed / this.duration, 1);
        
        // Apply easing (simplified)
        var easedProgress = this.ease(progress);
        
        for (var prop in this.endValues) {
          var start = this.startValues[prop];
          var end = this.endValues[prop];
          this.target[prop] = start + (end - start) * easedProgress;
        }
        
        if (progress < 1) {
          requestAnimationFrame(function() { self.animate(); });
        } else if (this.vars.onComplete) {
          this.vars.onComplete();
        }
      };

      Tween.prototype.ease = function(t) {
        // Circ.easeInOut approximation
        if (t < 0.5) {
          return 0.5 * (1 - Math.sqrt(1 - 4 * t * t));
        } else {
          return 0.5 * (Math.sqrt(1 - Math.pow(2 * t - 2, 2)) + 1);
        }
      };

      // Enhanced Particle System
      (function() {
        var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

        function initHeader() {
          width = window.innerWidth;
          height = window.innerHeight;
          target = { x: width / 2, y: height / 2 };

          canvas = document.getElementById('demo-canvas');
          canvas.width = width;
          canvas.height = height;
          ctx = canvas.getContext('2d');

          // Create points grid
          points = [];
          for (var x = 0; x < width; x += width / 15) {
            for (var y = 0; y < height; y += height / 15) {
              var px = x + Math.random() * width / 15;
              var py = y + Math.random() * height / 15;
              var p = { x: px, originX: px, y: py, originY: py };
              points.push(p);
            }
          }

          // Find closest points for each point
          for (var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for (var j = 0; j < points.length; j++) {
              var p2 = points[j];
              if (!(p1 == p2)) {
                var placed = false;
                for (var k = 0; k < 5; k++) {
                  if (!placed) {
                    if (closest[k] == undefined) {
                      closest[k] = p2;
                      placed = true;
                    }
                  }
                }

                for (var k = 0; k < 5; k++) {
                  if (!placed) {
                    if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                      closest[k] = p2;
                      placed = true;
                    }
                  }
                }
              }
            }
            p1.closest = closest;
          }

          // Assign circles to each point
          for (var i in points) {
            var c = new Circle(points[i], 2 + Math.random() * 2, 'rgba(0, 255, 255, 0.3)');
            points[i].circle = c;
          }
        }

        function addListeners() {
          if (!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
          }
          window.addEventListener('scroll', scrollCheck);
          window.addEventListener('resize', resize);
        }

        function mouseMove(e) {
          var posx = 0;
          var posy = 0;
          if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
          } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
          }
          target.x = posx;
          target.y = posy;
        }

        function scrollCheck() {
          animateHeader = document.body.scrollTop <= height;
        }

        function resize() {
          width = window.innerWidth;
          height = window.innerHeight;
          canvas.width = width;
          canvas.height = height;
        }

        function initAnimation() {
          animate();
          for (var i in points) {
            shiftPoint(points[i]);
          }
        }

        function animate() {
          if (animateHeader) {
            ctx.clearRect(0, 0, width, height);
            for (var i in points) {
              // Distance-based activation with enhanced colors
              if (Math.abs(getDistance(target, points[i])) < 4000) {
                points[i].active = 0.3;
                points[i].circle.active = 0.6;
              } else if (Math.abs(getDistance(target, points[i])) < 20000) {
                points[i].active = 0.1;
                points[i].circle.active = 0.3;
              } else if (Math.abs(getDistance(target, points[i])) < 40000) {
                points[i].active = 0.02;
                points[i].circle.active = 0.1;
              } else {
                points[i].active = 0;
                points[i].circle.active = 0;
              }

              drawLines(points[i]);
              points[i].circle.draw();
            }
          }
          requestAnimationFrame(animate);
        }

        function shiftPoint(p) {
          TweenLite.to(p, 1 + 1 * Math.random(), {
            x: p.originX - 50 + Math.random() * 100,
            y: p.originY - 50 + Math.random() * 100,
            ease: 'easeInOut',
            onComplete: function() {
              shiftPoint(p);
            }
          });
        }

        // Enhanced line drawing with cyan and pink colors
        function drawLines(p) {
          if (!p.active) return;
          for (var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            
            // Use your portfolio's color scheme
            var alpha = p.active;
            var distance = getDistance(p, target);
            if (distance < 2000) {
              ctx.strokeStyle = 'rgba(255, 0, 153, ' + alpha + ')'; // Pink when close to mouse
            } else {
              ctx.strokeStyle = 'rgba(0, 255, 255, ' + alpha + ')'; // Cyan normally
            }
            ctx.stroke();
          }
        }

        // Enhanced Circle class with your color scheme
        function Circle(pos, rad, color) {
          var self = this;
          
          (function() {
            self.pos = pos || null;
            self.radius = rad || null;
            self.color = color || null;
          })();

          this.draw = function() {
            if (!self.active) return;
            
            ctx.beginPath();
            ctx.arc(self.pos.x, self.pos.y, self.radius, 0, 2 * Math.PI, false);
            
            // Enhanced colors that match your theme
            var distance = getDistance(self.pos, target);
            if (distance < 2000) {
              ctx.fillStyle = 'rgba(255, 0, 153, ' + self.active + ')'; // Pink glow near mouse
            } else {
              ctx.fillStyle = 'rgba(0, 255, 255, ' + self.active + ')'; // Cyan normally
            }
            ctx.fill();
            
            // Add subtle glow effect
            ctx.beginPath();
            ctx.arc(self.pos.x, self.pos.y, self.radius * 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(100, 87, 198, ' + (self.active * 0.1) + ')'; // Purple glow
            ctx.fill();
          };
        }

        function getDistance(p1, p2) {
          return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
        }

        // Initialize everything
        function init() {
          initHeader();
          initAnimation();
          addListeners();
        }

        // Start when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', init);
        } else {
          init();
        }
      })();

      // Clock functionality
      Number.prototype.pad = function (n) {
        for (var r = this.toString(); r.length < n; r = 0 + r);
        return r;
      };

      function updateClock() {
        var now = new Date();
        var millisec = now.getMilliseconds(),
          sec = now.getSeconds(),
          min = now.getMinutes(),
          hour = now.getHours(),
          month = now.toLocaleString("default", { month: "long" }),
          day = now.getDate(),
          year = now.getFullYear();

        const tags = ["month", "day", "year", "hour", "min", "s", "millisec"],
          corr = [month, day, year, hour.pad(2), min.pad(2), sec.pad(2), millisec];

        for (var i = 0; i < tags.length; i++) {
          const element = document.getElementById(tags[i]);
          if (element && element.firstChild) {
            element.firstChild.nodeValue = corr[i];
          }
        }
      }

      // Start clock
      window.addEventListener('DOMContentLoaded', function() {
        updateClock();
        window.setInterval(updateClock, 1);
      });
    