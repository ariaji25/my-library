# PRD — My Library

## Overview

**My Library** adalah aplikasi web personal untuk mengelola koleksi buku, melacak progres membaca, menyimpan wishlist, serta mendokumentasikan pengalaman membaca melalui rating, review, catatan, dan kutipan favorit.

Aplikasi ini berfokus pada pengalaman visual yang nyaman dan elegan, menyerupai perpustakaan digital pribadi, bukan sekadar sistem pencatatan buku.

---

# Vision

Menciptakan ruang digital pribadi yang membuat pengguna menikmati koleksi bukunya, mengingat apa yang telah dibaca, dan mendokumentasikan perjalanan membaca secara bermakna.

---

# Goals

### Primary Goals

* Mengelola seluruh koleksi buku dalam satu tempat.
* Mengetahui status setiap buku (dibaca, sedang dibaca, wishlist).
* Menyimpan review dan penilaian pribadi.
* Menemukan kembali buku dan catatan dengan mudah.
* Menampilkan koleksi buku secara visual dan menarik.

### Success Metrics

* Pengguna dapat menemukan buku dalam ≤ 5 detik.
* Pengguna dapat menambahkan buku baru dalam ≤ 30 detik.
* Seluruh statistik koleksi dapat dilihat dalam satu halaman dashboard.

---

# Target User

### Primary User

Pembaca buku yang ingin memiliki perpustakaan digital pribadi.

### Characteristics

* Memiliki koleksi buku fisik maupun digital.
* Sering membeli buku baru.
* Menulis catatan atau review setelah membaca.
* Menginginkan tampilan yang rapi dan estetik.

---

# User Problems

### Current Problems

* Sulit mengingat buku yang sudah dibaca.
* Wishlist buku tersebar di berbagai tempat.
* Review dan catatan tersimpan tidak terorganisir.
* Tidak memiliki gambaran perkembangan membaca.

### Proposed Solution

Menyediakan dashboard personal yang menggabungkan:

* Koleksi buku
* Status membaca
* Wishlist
* Review
* Rating
* Statistik membaca

---

# Core Features

## 1. Dashboard

Halaman pertama yang dilihat pengguna.

### Statistics

Menampilkan:

* Total Books
* Read Books
* Currently Reading
* Unread Books
* Wishlist Books

### Reading Progress

Visual progress koleksi:

* Persentase buku yang sudah selesai dibaca
* Progress bar

### Genre Distribution

Visualisasi genre yang paling banyak dimiliki.

### Recent Activity

Menampilkan:

* Buku terakhir ditambahkan
* Buku terakhir selesai dibaca
* Review terbaru

---

## 2. Library

Halaman utama koleksi buku.

### Display Mode

Grid layout berbasis cover buku.

### Book Card

Menampilkan:

* Cover
* Judul
* Penulis
* Genre
* Rating
* Status

### Sorting

Urut berdasarkan:

* Judul A–Z
* Judul Z–A
* Rating tertinggi
* Rating terendah
* Tanggal ditambahkan
* Tahun terbit

### Filtering

Filter berdasarkan:

* Genre
* Status
* Rating
* Penulis

### Search

Pencarian instan berdasarkan:

* Judul
* Penulis
* Genre
* Review

---

## 3. Book Detail

Halaman detail untuk setiap buku.

### Information

* Cover
* Judul
* Penulis
* Genre
* Tahun Terbit
* Status

### Reading Information

* Tanggal mulai membaca
* Tanggal selesai membaca

### Rating

Skala:

1–5 bintang

### Review

Catatan pribadi pengguna.

Mendukung:

* Multi-line text
* Markdown

### Favorite Quotes

Menyimpan kutipan penting dari buku.

Pengguna dapat menambahkan lebih dari satu kutipan.

---

## 4. Reading Status

Setiap buku memiliki status:

### Not Started

Belum dibaca.

### Reading

Sedang dibaca.

### Completed

Sudah selesai dibaca.

### Wishlist

Ingin dibeli atau dibaca nanti.

---

## 5. Wishlist

Daftar buku yang ingin dibeli.

### Fields

* Judul
* Penulis
* Prioritas
* Catatan

### Priority Levels

* High
* Medium
* Low

---

## 6. Collections

Pengguna dapat membuat kelompok buku sendiri.

Contoh:

* Best Books of 2026
* Must Re-read
* Life Changing Books
* Productivity Collection

---

# User Flow

## Add Book

Library → Add Book → Save

## Start Reading

Book Detail → Change Status → Reading

## Finish Reading

Book Detail → Change Status → Completed → Add Rating → Add Review

## Add Wishlist

Wishlist → Add Book

---

# Data Model

## Book

| Field         | Type     |
| ------------- | -------- |
| id            | UUID     |
| title         | String   |
| author        | String   |
| genre         | String   |
| publishedYear | Number   |
| coverImage    | String   |
| status        | Enum     |
| rating        | Number   |
| review        | Text     |
| createdAt     | DateTime |
| updatedAt     | DateTime |

---

## Quote

| Field   | Type |
| ------- | ---- |
| id      | UUID |
| bookId  | UUID |
| content | Text |

---

## Collection

| Field       | Type   |
| ----------- | ------ |
| id          | UUID   |
| name        | String |
| description | Text   |

---

## Wishlist

| Field    | Type   |
| -------- | ------ |
| id       | UUID   |
| title    | String |
| author   | String |
| priority | Enum   |
| notes    | Text   |

---

# UI & UX Requirements

## Design Principles

### Personal

Harus terasa seperti ruang pribadi.

### Visual First

Cover buku menjadi elemen utama.

### Minimal

Mengurangi tabel dan tampilan administratif.

### Comfortable

Nyaman digunakan untuk membaca dalam waktu lama.

---

# Design Style

## Inspiration

* Apple Books
* Goodreads
* Readwise
* Notion

---

## Layout

### Dashboard

* Hero Section
* Statistics Cards
* Reading Progress
* Genre Analytics
* Recent Activity

### Library

Responsive Grid Layout

Desktop:

5–6 kolom

Tablet:

3–4 kolom

Mobile:

2 kolom

---

# Color Palette

## Light Mode

Background:
#F8F7F4

Card:
#FFFFFF

Primary:
#2563EB

Text:
#111827

---

## Dark Mode

Background:
#0F1115

Card:
#1A1D24

Primary:
#EAB308

Text:
#F9FAFB

---

# Typography

## Heading

Playfair Display

## Body

Inter

---

# MVP Scope

## Included

* Dashboard
* Library Grid
* CRUD Buku
* Status Buku
* Rating
* Review
* Search
* Wishlist
* Collections

## Excluded

* Social Features
* Book Sharing
* AI Recommendation
* Goodreads Sync
* OCR Scanner

---

# Future Roadmap

## Version 2

* Reading Streak
* Reading Goals
* Monthly Statistics
* Favorite Authors
* Genre Insights

## Version 3

* ISBN Scanner
* OCR Cover Recognition
* Goodreads Import
* Export Review PDF

## Version 4

* AI Book Recommendation
* AI Review Summary
* AI Reading Insights

---

# Recommended Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

## Backend

* Next.js API Routes

## Database

* PostgreSQL

## ORM

* Prisma

## Authentication

* Auth.js

## Hosting

* Vercel

## Database Hosting

* Supabase

