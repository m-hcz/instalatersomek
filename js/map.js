/* ==========================================================================
   Instalatér Šomek — mapa oblasti. Progresivní vylepšení, jako všechno ostatní.

   Bez JavaScriptu (nebo když se nepodaří načíst data) zůstane v [data-map]
   statický obrázek s odkazem do mapové aplikace. Nic se nerozbije.

   Podkladové dlaždice jdou z tile.openstreetmap.org (rozhodnutí majitele,
   2026-08-04). Tím se IP adresa každého návštěvníka dostane k OpenStreetMap
   Foundation — proto je OSMF uvedená mezi příjemci v ochrana-osobnich-udaju.html.
   Ověřeno: server neposílá Set-Cookie, takže souhlasová lišta nevzniká.

   Pravidla OSMF, která se nesmí porušit (operations.osmfoundation.org/policies/tiles):
   povolené je jen běžné interaktivní prohlížení, kdy se stahují dlaždice pro
   právě zobrazený výřez. NIKDY nepřidávat předstahování, offline režim ani
   procházení bboxu — to je "bulk downloading" a blokují ho bez varování.
   Atribuce OpenStreetMap musí zůstat viditelná v mapě.
   ========================================================================== */

(function () {
  'use strict';

  var host = document.querySelector('[data-map]');
  if (!host || !window.L) { return; }

  /* Which region is drawn comes from the page, not from here: the path is
     data-geojson on [data-map], written there from `krajGeojson` in
     values.json. Moving to another kraj is a value change, not a code change. */
  var src = host.getAttribute('data-geojson');
  if (!src) { return; }

  fetch(src)
    .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error(res.status)); })
    .then(function (data) { build(data); })
    .catch(function () { /* fallback obrázek zůstane na místě */ });

  function build(data) {
    var css = getComputedStyle(document.documentElement);
    var line = (css.getPropertyValue('--blue-700') || '').trim() || '#0b5fa5';
    var fill = (css.getPropertyValue('--blue-600') || '').trim() || '#1273c4';

    host.textContent = '';
    /* Třída musí být na kontejneru dřív, než se zavolá L.map() — Leaflet si
       změří výšku při inicializaci a bez ní by vyšla nula. */
    host.className += ' map--live';
    /* Leaflet dá kontejneru tabindex, takže se na něj dá zaostřit. Ohraničený
       a pojmenovaný region z něj udělá něco, co odečítač umí oznámit. Mapa je
       jen doplněk — obce jsou vypsané textem v odstavci nad ní. */
    host.setAttribute('role', 'region');
    host.setAttribute('aria-label', 'Mapa Zlínského kraje — oblasti, kam dojíždím');

    var map = L.map(host, {
      /* Kolečko myši necháváme stránce. Jinak se při scrollování přes mapu
         místo posunu stránky zoomuje, což lidi spolehlivě naštve. */
      scrollWheelZoom: false,
      /* Na dotyku by tažení mapy sebralo svislý scroll a návštěvník by na
         mapě uvízl. Přibližovat jde pořád prsty i tlačítky. */
      dragging: !L.Browser.mobile
    });

    /* Bez subdomén a.b.c — ty jsou u OSM zastaralé. Atribuce je stejný řetězec
       jako u hranic níže; Leaflet shodné atribuce spojí do jedné. */
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© přispěvatelé <a href="https://www.openstreetmap.org/copyright" ' +
                   'rel="noopener">OpenStreetMap</a>'
    }).addTo(map);

    var region = L.geoJSON(data, {
      attribution: '© přispěvatelé <a href="https://www.openstreetmap.org/copyright" ' +
                   'rel="noopener">OpenStreetMap</a>',
      style: {
        color: line,
        weight: 3,
        opacity: 1,
        /* Slabší výplň než bez podkladu — pod ní musí být vidět mapa. */
        fillColor: fill,
        fillOpacity: 0.08
      }
    }).addTo(map);

    /* Hranice se kreslí do overlayPane, který je nad tilePane, a nezávisí na
       dlaždicích. Když OSMF přístup odřízne (což si podle svých pravidel
       u komerčních webů výslovně vyhrazuje), zůstane čitelný obrys kraje nad
       podkladovou barvou místo prázdného šedého čtverce. Volání níže je jen
       pojistka pro případ, že by někdo přidal další vrstvu. */
    region.bringToFront();

    var bounds = region.getBounds();
    map.fitBounds(bounds, { padding: [12, 12] });
    map.setMinZoom(map.getZoom());
    /* Strop přiblížení má dva důvody. Hranice kraje je zjednodušená na ~45 m,
       což je pod rozlišením do zhruba této úrovně, ale dál už by se viditelně
       rozcházela se skutečností. A pravidla OSMF zmiňují vysoké zoomy (z>=14)
       jako to, co hlídají — mapa slouží k ukázání oblasti, ne k hledání ulic;
       od toho je odkaz do mapy.cz. */
    map.setMaxZoom(map.getZoom() + 4);
    map.setMaxBounds(bounds.pad(0.25));
    map.attributionControl.setPrefix(
      '<a href="https://leafletjs.com/" rel="noopener">Leaflet</a>'
    );

    /* Kdyby se kontejner dopočítal až po vykreslení (fonty, obrázky vedle). */
    setTimeout(function () { map.invalidateSize(); }, 0);
  }
})();
