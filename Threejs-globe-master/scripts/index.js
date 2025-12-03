const app = new App({ setup, animate, preload });

window.onload = app.init;
window.onresize = app.handleResize;

const loader = new THREE.TextureLoader();
const controls = {}
const data = {}


async function fetchAndProcessData() {
  try {
    // Fetch dynamic data from backend
    const response = await fetch('/api/dashboard-data');
    const dashboardData = await response.json();

    console.log(`[${new Date().toLocaleTimeString()}] Data updated. Active countries: ${dashboardData.countries ? dashboardData.countries.length : 0}`);

    // Helper to normalize country names for matching
    const normalizeName = (name) => {
      const map = {
        // Turkish -> English
        'Türkiye': 'Turkey',
        'Turkiye': 'Turkey',
        'Amerika Birleşik Devletleri': 'United States',
        'ABD': 'United States',
        'Almanya': 'Germany',
        'Birleşik Krallık': 'United Kingdom',
        'İngiltere': 'United Kingdom',
        'Hollanda': 'Netherlands',
        'Fransa': 'France',
        'İtalya': 'Italy',
        'İspanya': 'Spain',
        'Rusya': 'Russia', // Note: Check if Russia is in countries.js, if not, map to closest or ignore
        'Çin': 'China',
        'Japonya': 'Japan',
        'Güney Kore': 'South Korea',
        'Hindistan': 'India',
        'Brezilya': 'Brazil',
        'Kanada': 'Canada',
        'Avustralya': 'Australia',
        'Yunanistan': 'Greece',
        'Azerbaycan': 'Azerbaijan',
        'Mısır': 'Egypt',
        'İran': 'Iran',
        'Irak': 'Iraq',
        'Suriye': 'Syria',
        'Suudi Arabistan': 'Saudi Arabia',
        'Belçika': 'Belgium',
        'İsveç': 'Sweden',
        'Norveç': 'Norway',
        'Danimarka': 'Denmark',
        'Finlandiya': 'Finland',
        'Polonya': 'Poland',
        'Ukrayna': 'Ukraine',
        'Romanya': 'Romania',
        'Bulgaristan': 'Bulgaria',

        // English Variations
        'United States of America': 'United States',
        'USA': 'United States',
        'The Netherlands': 'Netherlands'
      };
      return map[name] || name;
    };

    // 1. Update Countries with Active Users
    if (data.countries && dashboardData.countries) {
       console.log('Merging data...', { static: data.countries.length, dynamic: dashboardData.countries.length });

       // Log incoming dynamic names for debugging
       console.log('Dynamic Countries:', dashboardData.countries.map(c => c.name));

       data.countries.forEach(c => {
         // Try matching with normalized names
         const active = dashboardData.countries.find(ac => normalizeName(ac.name) === normalizeName(c.name));
         c.activeUsers = active ? active.activeUsers : 0;
         if (active) console.log(`MATCH! Updated ${c.name}: ${c.activeUsers} active users`);
       });
    }

    // 2. Construct Connections (Routes)
    // Map backend routes to format: { "StartCountry": ["EndCountry", ...] }
    const rawConnections = {};

    // Ensure Turkey exists in data.countries for lookup
    const turkey = data.countries.find(c => c.name === 'Turkey');

    if (turkey && dashboardData.countries) {
      dashboardData.countries.forEach(c => {
        // Normalize the incoming country name
        const normalizedName = normalizeName(c.name);

        // Create a connection from every active country to Turkey
        if (c.activeUsers > 0 && normalizedName !== 'Turkey') {
          // Verify country exists in our static list using normalized name
          const startCountry = data.countries.find(sc => sc.name === normalizedName);
          if (startCountry) {
            if (!rawConnections[normalizedName]) rawConnections[normalizedName] = [];
            rawConnections[normalizedName].push('Turkey');
          }
        }
      });
    }

    // 3. Process connections using helper from processing.js
    // getCountries converts names to country objects
    data.connections = getCountries(rawConnections, data.countries);

    return true;
  } catch(error) {
    console.log('Error loading dashboard data:', error);
    // Fallback to empty connections to prevent crash
    data.connections = {};
    return false;
  }
}

async function preload() {
  return await fetchAndProcessData();
}

function updateVisualization() {
  console.log('Updating visualization with new data...');

  // Remove old groups from the scene
  if (groups.markers) {
    groups.globe.remove(groups.markers);
  }
  if (groups.lines) {
    groups.globe.remove(groups.lines);
  }
  if (groups.lineDots) {
    groups.globe.remove(groups.lineDots);
  }

  // Clear global element arrays to prevent duplicates and old references
  elements.markers = [];
  elements.lines = [];
  elements.lineDots = [];

  // Re-instantiate components with new data
  new Markers(data.countries);
  groups.globe.add(groups.markers);

  new Lines();
  groups.globe.add(groups.lines);
  // Note: new Lines() calls createDots() which adds groups.lineDots to groups.globe automatically
}

function startRealtimeUpdates() {
  setInterval(async () => {
    const success = await fetchAndProcessData();
    if (success) {
      updateVisualization();
    }
  }, 10000); // 10 seconds
}


function setup(app) {
  const controllers = [];

  app.addControlGui(gui => {
    const colorFolder = gui.addFolder('Colors');
    controllers.push(colorFolder.addColor(config.colors, 'globeDotColor'))
    controllers.push(colorFolder.addColor(config.colors, 'globeMarkerColor'))
    controllers.push(colorFolder.addColor(config.colors, 'globeMarkerGlow'))
    controllers.push(colorFolder.addColor(config.colors, 'globeLines'))
    controllers.push(colorFolder.addColor(config.colors, 'globeLinesDots'))

    const sizeFolder = gui.addFolder('Sizes')
    controllers.push(sizeFolder.add(config.sizes, 'globeDotSize', 1, 5))
    controllers.push(sizeFolder.add(config.scale, 'globeScale', 0.1, 1))

    const displayFolder = gui.addFolder('Display');
    controllers.push(displayFolder.add(config.display, 'map'))
    controllers.push(displayFolder.add(config.display, 'points'))
    controllers.push(displayFolder.add(config.display, 'markers'))
    controllers.push(displayFolder.add(config.display, 'markerLabel'))
    controllers.push(displayFolder.add(config.display, 'markerPoint'))

    const animationsFolder = gui.addFolder('Animations');
    controllers.push(animationsFolder.add(animations, 'rotateGlobe'))


    sizeFolder.open();
  });

  controllers.forEach(controller => {
    controller.onChange((event) => {
      controls.changed = true;
    })
  })

  app.camera.position.z = config.sizes.globe * 2.85;
  app.camera.position.y = config.sizes.globe * 0;
  app.controls.enableDamping = true;
  app.controls.dampingFactor = 0.05;
  app.controls.rotateSpeed = 0.07;

  groups.main = new THREE.Group();
  groups.main.name = 'Main';

  const globe = new Globe();
  groups.main.add(globe);

  const points = new Points(data.grid);
  groups.globe.add(groups.points);

  const markers = new Markers(data.countries);
  groups.globe.add(groups.markers);

  const lines = new Lines();
  groups.globe.add(groups.lines);

  app.scene.add(groups.main);

  // Start polling for data
  startRealtimeUpdates();
}


function animate(app) {
  if(controls.changed) {
    if(elements.globePoints) {
      elements.globePoints.material.size = config.sizes.globeDotSize;
      elements.globePoints.material.color.set(config.colors.globeDotColor);
    }

    if(elements.globe) {
      elements.globe.scale.set(
        config.scale.globeScale,
        config.scale.globeScale,
        config.scale.globeScale
      );
    }

    if(elements.lines) {
      for(let i = 0; i < elements.lines.length; i++) {
        const line = elements.lines[i];
        line.material.color.set(config.colors.globeLines);
      }
    }

    groups.map.visible = config.display.map;
    groups.markers.visible = config.display.markers;
    groups.points.visible = config.display.points;

    for(let i = 0; i < elements.markerLabel.length; i++) {
      const label = elements.markerLabel[i];
      label.visible = config.display.markerLabel;
    }

    for(let i = 0; i < elements.markerPoint.length; i++) {
      const point = elements.markerPoint[i];
      point.visible = config.display.markerPoint;
    }

    controls.changed = false
  }



  if(elements.lineDots) {
    for(let i = 0; i < elements.lineDots.length; i++) {
      const dot = elements.lineDots[i];
      dot.material.color.set(config.colors.globeLinesDots);
      dot.animate();
    }
  }

  if(elements.markers) {
    for(let i = 0; i < elements.markers.length; i++) {
      const marker = elements.markers[i];
      marker.point.material.color.set(config.colors.globeMarkerColor);
      marker.glow.material.color.set(config.colors.globeMarkerGlow);
      marker.label.material.map.needsUpdate = true;
      marker.animateGlow();
    }
  }

  if(animations.rotateGlobe) {
    groups.globe.rotation.y -= 0.0025;
  }
}

