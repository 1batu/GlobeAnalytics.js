class Markers {
  constructor(countries, {
    markerRadius = 2
  } = {}) {
    this.countries = countries;
    this.radius = config.sizes.globe + config.sizes.globe * config.scale.markers;

    groups.markers = new THREE.Group();
    groups.markers.name = 'GlobeMarkers';

    this.markerGeometry = new THREE.SphereGeometry(markerRadius, 15, 15);
    this.markerMaterial = new THREE.MeshBasicMaterial();
    this.markerMaterial.transparent = true;
    this.markerMaterial.opacity = 0.8;

    this.create();
  }

  create() {
    let createdCount = 0;
    for(let i = 0; i < this.countries.length; i++) {
      const country = this.countries[i];
      if(country.latitude && country.longitude && country.activeUsers > 0) {
        const lat = +country.latitude;
        const lng = +country.longitude;

        const cords = toSphereCoordinates(lat, lng, this.radius);

        const isActive = country.activeUsers > 0;
        const label = country.name + (isActive ? `\n${country.activeUsers} active` : '');

        const marker = new Marker(this.markerMaterial, this.markerGeometry, label, cords, {
          pointColor: isActive ? '#22d3ee' : config.colors.globeMarkerColor,
          glowColor: isActive ? '#ffffff' : config.colors.globeMarkerGlow
        });

        elements.markers.push(marker);
        groups.markers.add(marker.mesh); // Ensure marker mesh is added to the group!
        createdCount++;
      }
    }
    console.log(`Created ${createdCount} markers for active countries.`);
  }
}