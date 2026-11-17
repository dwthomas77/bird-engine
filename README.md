# Bird Engine API

Bird Engine is a RESTful API built with **Node.js**, **Fastify**, and **TypeScript** for managing bird species and their habitats. The project uses JSON Schema validation, automatic OpenAPI (Swagger) documentation generation, and follows a schema-first approach for API contracts.

## Features

- Fastify-based REST API
- TypeScript support
- JSON Schema request and response validation
- OpenAPI 3.0 documentation
- Swagger UI integration
- CRUD operations for:
  - Species
  - Habitats
  - Journals
- ESLint-based code quality checks

---

## Technology Stack

- Node.js
- Fastify
- TypeScript
- JSON Schema
- OpenAPI / Swagger
- ESLint

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd bird-engine
```

Install dependencies:

```bash
npm install
```

---

## Running the Application

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

The API will be available at:

```text
http://localhost:3000
```

---

## API Documentation

Swagger UI is available at:

```text
http://localhost:3000/docs
```

OpenAPI JSON specification:

```text
http://localhost:3000/docs/json
```

---

# Data Models

## Observation Group Family

Observation groups can be linked directly to taxonomic families through
`data/observationGroupFamily.data.json`. Each relationship has an
`observationGroupId` and a `familyId`, which refers to a family `taxonId` in
`data/taxon.data.json`. The service validates both IDs and prevents duplicate
pairs. This relationship is managed through the service; it has no API route.

### Observation group membership rules

Species, genus, and family relationships accept an optional `excluded` boolean.
Absent or `false` includes the taxon; `true` excludes it. Adding an existing
group-and-taxon pair updates its rule, while removing it deletes the rule.
`observationGroupMembership.getSpeciesForGroup()` resolves the most specific
rule first: species, then genus, then family. Species with no matching rule are
not members. Rules apply only to the specified group; `parentId` does not
inherit membership rules. Relationship management and membership resolution are
service operations and do not have API routes.

The species repository's `synchronizeRelationships` replaces all species rules
for one group with inclusive rules for the supplied species IDs.

## Habitat

Represents a habitat where bird species may be found.

### Properties

| Field | Type | Description |
|---------|---------|---------|
| habitatId | string | Unique habitat identifier |
| code | string | Unique habitat code |
| name | string | Name of the habitat |
| parentHabitatId | string (optional) | Parent habitat identifier |
| description | string (optional) | Description of the habitat |

### Example

```json
{
  "habitatId": "forest",
  "code": "forest",
  "name": "Temperate Forest",
  "description": "Dense woodland with seasonal climate"
}
```

---

## Species

Represents a bird species.

### Properties

| Field | Type |
|---------|---------|
| speciesId | string |
| speciesName | string |
| family | string |
| genus | string |
| localeName | string |
| lengthMin | number |
| lengthMax | number |
| weightMin | number |
| weightMax | number |
| wingspanMin | number |
| wingspanMax | number |
| habitats | Habitat[] |

### Example

```json
{
  "speciesId": "1",
  "speciesName": "Bald Eagle",
  "family": "Accipitridae",
  "genus": "Haliaeetus",
  "localeName": "American Bald Eagle",
  "lengthMin": 70,
  "lengthMax": 102,
  "weightMin": 3,
  "weightMax": 6.3,
  "wingspanMin": 180,
  "wingspanMax": 230,
  "habitats": [
    {
      "habitatId": "wetlands",
      "code": "wetlands",
      "name": "Wetlands",
      "description": "Marshes, lakes, and rivers"
    }
  ]
}
```

---

# API Endpoints

## Habitats

### Get All Habitats

```http
GET /habitats
```

Returns a collection of habitats.

---

### Get Habitat By Id

```http
GET /habitats/{uid}
```

Returns a specific habitat.

---

### Create Habitat

```http
POST /habitats
```

Creates a new habitat.

---

### Update Habitat

```http
PUT /habitats/{uid}
```

Updates an existing habitat.

---

### Delete Habitat

```http
DELETE /habitats/{uid}
```

Deletes a habitat.

---

## Species

### Get All Species

```http
GET /species
```

Returns all species.

---

### Get Species By Id

```http
GET /species/{uid}
```

Returns a specific species.

---

### Create Species

```http
POST /species
```

Creates a new species.

---

### Update Species

```http
PUT /species/{uid}
```

Updates an existing species.

---

### Delete Species

```http
DELETE /species/{uid}
```

Deletes a species.

---

## Journals

Journals can be listed, retrieved, created, updated, and deleted using:

```http
GET    /journals
GET    /journals/{journalId}
POST   /journals
PUT    /journals/{journalId}
DELETE /journals/{journalId}
```

Journal creation and update requests include `userId`, `name`, `createdAt`,
and `updatedAt`; `description` is optional. The API generates `journalId`.

---

## Validation

The API uses Fastify JSON Schema validation for:

- Route parameters
- Query strings
- Request bodies
- Response payloads

Validation errors return appropriate HTTP status codes and descriptive error messages.

---

## Project Structure

```text
src/
├── modules/
│   ├── habitats/
│   │   ├── habitat.controller.ts
│   │   ├── habitat.routes.ts
│   │   └── habitat.schema.ts
│   │
│   └── species/
│       ├── species.controller.ts
│       ├── species.routes.ts
│       └── species.schema.ts
│
├── plugins/
├── app.ts
└── main.ts
```

---

## Linting

Run ESLint:

```bash
npm run lint
```

Automatically fix issues:

```bash
npm run lint:fix
```

---

## Future Enhancements

- Database persistence
- Authentication and authorization
- Search and filtering
- Pagination
- Bird sighting records
- Geographic habitat mapping
- Automated tests and CI/CD

---

## License

Licensed under the MIT License.