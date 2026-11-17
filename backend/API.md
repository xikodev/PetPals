# PetPals Backend API

Dokumentacija trenutačno implementiranih ruta, HTTP statusa i strukture odgovora.

🟢 **Uspjeh — 2xx** · 🟠 **Greška zahtjeva — 4xx** · 🔴 **Greška servera — 5xx**

> [!NOTE]
> API je u početnoj fazi. Trenutačno postoje tri GET rute. Nema implementiranih
> ruta za prijavu, korisnike, ljubimce ni rezervacije. Primjer `/api/examples`
> koristi podatke iz memorije, a ne iz PostgreSQL baze.

## Sadržaj

- [Adrese i slanje zahtjeva](#adrese-i-slanje-zahtjeva)
- [Pregled ruta](#pregled-ruta)
- [GET /](#get-)
- [GET /health](#get-health)
- [GET /api/examples](#get-apiexamples)
- [Nepostojeća ruta ili metoda](#nepostojeca-ruta-ili-metoda)
- [HTTP statusni kodovi](#http-statusni-kodovi)
- [Struktura odgovora i obrada grešaka](#struktura-odgovora-i-obrada-gresaka)
- [Gdje se API nalazi u kodu](#gdje-se-api-nalazi-u-kodu)

<a id="adrese-i-slanje-zahtjeva"></a>
## Adrese i slanje zahtjeva

| Okruženje | Osnovna adresa |
| --- | --- |
| Lokalno, zadani port | `http://localhost:10000` |
| Render, nakon uspješnog deploya | `https://petpals-backend-bfo2.onrender.com` |

Primjeri ispod koriste lokalnu adresu. Za Render zamijeni osnovnu adresu.
Stvarna dostupnost Render servisa ovisi o deployu; lokalna provjera ruta ne
potvrđuje da je ista verzija već objavljena.

- Dokumentirane GET rute ne zahtijevaju autentikaciju, parametre ni tijelo zahtjeva.
- API trenutačno nema verzijski prefiks poput `/api/v1`.
- `/` i `/health` su na korijenu aplikacije; primjer je pod `/api/examples`.
- Globalni `express.json()` obrađuje JSON zahtjeve sa zadanim limitom od
  **100 KiB (102 400 bajtova)**. Trenutačne rute ne koriste ulazne JSON podatke.
- Express automatski podržava i `HEAD` za postojeće GET rute: isti status i
  zaglavlja, bez tijela odgovora.

Za lokalno pokretanje slijedi [backend README](README.md#run-locally).
`npm start` provjerava vezu s bazom prije pokretanja HTTP servera. Ako provjera
ne uspije, server se ne pokreće i nema aplikacijskog HTTP odgovora.

<a id="pregled-ruta"></a>
## Pregled ruta

| Metoda | Putanja | Namjena | Uspješan status | Format tijela |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Osnovna potvrda da API odgovara | 🟢 `200 OK` | Tekst `API running` |
| `GET` | `/health` | Provjera da HTTP aplikacija odgovara | 🟢 `200 OK` | JSON objekt |
| `GET` | `/api/examples` | Privremeni primjer slojevite API rute | 🟢 `200 OK` | JSON niz objekata |
| Bilo koja nepodržana ruta/metoda nakon parsiranja zahtjeva | Npr. `/missing` ili `POST /health` | Završni 404 handler | 🟠 `404 Not Found` | JSON objekt s poljem `error` |

<a id="get-"></a>
## GET /

Vraća osnovnu poruku da API odgovara. Ne provjerava bazu tijekom zahtjeva.

**Zahtjev**

```bash
curl -i http://localhost:10000/
```

**Odgovor — 🟢 `200 OK`**

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

API running
```

Tijelo je tekstualna poruka. Trenutačni `res.send()` postavlja `text/html`,
pa odgovor nemoj obrađivati pomoću `response.json()`.

<a id="get-health"></a>
## GET /health

Vraća informaciju da HTTP aplikacija odgovara.

**Zahtjev**

```bash
curl -i http://localhost:10000/health
```

**Odgovor — 🟢 `200 OK`**

Content-Type: `application/json; charset=utf-8`

```json
{
  "status": "healthy"
}
```

| Polje | Tip | Trenutačna vrijednost | Značenje |
| --- | --- | --- | --- |
| `status` | `string` | `"healthy"` | HTTP handler je dostupan i odgovorio je |

> [!IMPORTANT]
> Ova ruta ne izvršava SQL upit. Baza se provjerava pri pokretanju servera,
> ali `/health` može nastaviti vraćati `200` ako se veza s bazom kasnije prekine.
> Trenutačno ne postoji HTTP ruta za zasebnu provjeru dostupnosti baze.

<a id="get-apiexamples"></a>
## GET /api/examples

Vraća privremeni popis iz example repositoryja. Služi kao primjer toka
router → controller → service → repository.

**Zahtjev**

```bash
curl -i http://localhost:10000/api/examples
```

**Odgovor — 🟢 `200 OK`**

Content-Type: `application/json; charset=utf-8`

```json
[
  {
    "id": 1,
    "name": "Example pet"
  }
]
```

Tijelo je izravno JSON niz, bez omotača poput `{ "data": [...] }`.

| Polje stavke | Tip | Primjer | Značenje |
| --- | --- | --- | --- |
| `id` | `number` | `1` | Identifikator privremenog primjera |
| `name` | `string` | `"Example pet"` | Naziv privremenog primjera |

Ovo nisu zapisi iz baze niti konačan model ljubimca. Nema implementirane
paginacije, filtriranja, detalja po ID-u ni upisa/izmjene/brisanja primjera.

<a id="nepostojeca-ruta-ili-metoda"></a>
## Nepostojeća ruta ili metoda

Ako nijedna ruta ne obradi zahtjev, završni handler vraća JSON grešku.

**Zahtjevi**

```bash
curl -i http://localhost:10000/missing
curl -i -X POST http://localhost:10000/health
```

**Odgovor za oba primjera — 🟠 `404 Not Found`**

Content-Type: `application/json; charset=utf-8`

```json
{
  "error": "Not found"
}
```

| Polje | Tip | Vrijednost | Značenje |
| --- | --- | --- | --- |
| `error` | `string` | `"Not found"` | Nema handlera za zadanu putanju i metodu |

Za nepodržane metode aplikacija trenutačno ne vraća `405 Method Not Allowed`.
Ako JSON parser prethodno odbije zahtjev, vraća se njegova greška umjesto `404`.

<a id="http-statusni-kodovi"></a>
## HTTP statusni kodovi

| Status | Značenje | Kada se pojavljuje | Format odgovora |
| --- | --- | --- | --- |
| 🟢 `200 OK` | Zahtjev je uspješan | Postojeće GET rute | Tekst za `/`, JSON za ostale |
| 🟠 `400 Bad Request` | Neispravan zahtjev | Npr. sintaktički neispravan JSON uz `Content-Type: application/json` | Expressova HTML stranica greške |
| 🟠 `404 Not Found` | Ruta/metoda nije pronađena | Npr. `GET /missing` ili `POST /health` bez tijela | `{ "error": "Not found" }` |
| 🟠 `413 Payload Too Large` | Preveliko tijelo zahtjeva | JSON veći od zadanog limita od 100 KiB | Expressova HTML stranica greške |
| 🟠 `415 Unsupported Media Type` | Nepodržan format kodiranja | Npr. JSON s nepodržanim `charset` parametrom | Expressova HTML stranica greške |
| 🔴 `500 Internal Server Error` | Neočekivana serverska greška | Expressov zadani handler ako dođe do neobrađene greške; nema namjenske rute koja je izaziva | Expressova HTML stranica greške |

Tablica obuhvaća trenutačne odgovore ruta i važne zadane greške middlewarea;
nije popis svih mogućih HTTP statusa. Statusi `200`, `400`, `404`, `413` i `415`
provjereni su lokalnim zahtjevima. `500` opisuje zadano rukovanje neočekivanom
greškom, a nije rezultat namjerno dodane greške u aplikaciju.

Primjer koji izaziva `400`:

```bash
curl -i -X POST http://localhost:10000/health \
  -H 'Content-Type: application/json' \
  --data '{"broken":'
```

Primjer koji izaziva `415`:

```bash
curl -i -X POST http://localhost:10000/health \
  -H 'Content-Type: application/json; charset=unsupported' \
  --data '{}'
```

<a id="struktura-odgovora-i-obrada-gresaka"></a>
## Struktura odgovora i obrada grešaka

Trenutačno **ne postoji jedinstven format odgovora** niti zasebni aplikacijski
kodovi grešaka poput `PET_NOT_FOUND`. HTTP status nalazi se u HTTP odgovoru;
ne ponavlja se kao JSON polje `statusCode`.

| Vrsta odgovora | Trenutačna struktura |
| --- | --- |
| Osnovna ruta | Tekst `API running` |
| Health | `{ "status": "healthy" }` |
| Popis primjera | `[{ "id": 1, "name": "Example pet" }]` |
| Nepostojeća ruta | `{ "error": "Not found" }` |
| Greške parsera / neočekivane greške | HTML, bez stabilne JSON sheme |

> [!WARNING]
> Backend još nema zajednički JSON error middleware. Klijent treba provjeriti
> HTTP status i `Content-Type` prije parsiranja odgovora kao JSON-a. Expressov
> prikaz HTML greške razlikuje se ovisno o `NODE_ENV`; nemoj ga koristiti kao
> stabilan ugovor niti računati na točan tekst greške.

<a id="gdje-se-api-nalazi-u-kodu"></a>
## Gdje se API nalazi u kodu

| Datoteka | Odgovornost |
| --- | --- |
| [`src/app.js`](src/app.js) | JSON parser, `/`, `/health`, registracija routera i završni `404` |
| [`example.routes.js`](src/modules/example/example.routes.js) | `GET /` relativno na `/api/examples` |
| [`example.controller.js`](src/modules/example/example.controller.js) | Slanje JSON odgovora za popis |
| [`example.service.js`](src/modules/example/example.service.js) | Poziv repositoryja |
| [`example.repository.js`](src/modules/example/example.repository.js) | Privremeni podaci iz memorije |
| [`src/server.js`](src/server.js) | Početna provjera baze i pokretanje HTTP servera |

Pri dodavanju ili izmjeni rute ažuriraj ovu dokumentaciju: metodu, putanju,
parametre, tijelo zahtjeva, statuse, polja odgovora i konkretne primjere.
