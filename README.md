# README

This repository contains a web application that displays a list of countries, allows users to mark favorites, and provides a population chart. The app is built using Vue.js and PrimeVue components.

## How to Run the App Locally

To run the app locally on your machine, follow these steps:

### Prerequisites

1. **Node.js**: Make sure you have Node.js installed. You can download it from [https://nodejs.org/](https://nodejs.org/).

### Clone the Repository

1. Open your terminal or command prompt.

2. Use `git` to clone this repository to your local machine:

   ```shell
   git clone https://github.com/Dinie97/rest-countries.git
   ```

3. Change to the project directory:

   ```shell
   cd rest-countries
   ```

### Install Dependencies

1. Inside the project directory, install the project's dependencies using `npm`:

   ```shell
   npm install
   ```

### Run the App

1. After the installation is complete, start the app with the following command:

   ```shell
   npm run serve
   ```

2. The app will be available locally at `http://localhost:8080/`.

### Access the Live Version

You can also access a live version of this app at [https://dinie97.github.io/rest-countries/](https://dinie97.github.io/rest-countries/).

## App Structure

The app's structure consists of Vue.js components, including a DataTable for displaying country data, buttons to mark favorites, a search bar, and a population chart.

### Key Components and Features

- **DataTable**: Displays a list of countries with pagination, filtering, and sorting capabilities.

- **Favorites**: Users can mark countries as favorites, and the list of favorites is stored locally.

- **Search Bar**: Allows users to search for countries by keyword.

- **Population Chart**: Displays a bar chart of the population of favorite countries.

