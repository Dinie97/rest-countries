<template>
  <div class="card">
    <!-- DataTable for displaying a list of countries -->
    <DataTable
      :value="countries"
      :paginator="true"
      dataKey="id"
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
      v-model:filters="filters"
      tableStyle="min-width: 50rem"
    >
      <template #header>
        <div class="flex justify-content-start">
          <Button label="Clear All Favourite" @click="clearFav()" />
        </div>
        <div class="flex justify-content-end">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Keyword Search"
            />
          </span>
        </div>
      </template>
      <!-- Columns for displaying data -->
      <Column field="favourite" header="Favourite">
        <!-- Checkbox to add and remove a country as a favorite, can also be use to see the population -->
        <template #body="slotProps">
          <Checkbox
            v-model="slotProps.data.favourite"
            :binary="true"
            @click="addToFavourite(slotProps.data.id, slotProps.data.favourite)"
          />
        </template>
      </Column>
      <Column header="Flag">
        <template #body="slotProps">
          <img
            :src="`${slotProps.data.flag}`"
            :alt="slotProps.data.name"
            class="w-6rem shadow-2 border-round"
          />
        </template>
      </Column>
      <Column field="name" sortable header="Name">
        <!-- Display country name with highlighted search text -->
        <template #body="slotProps">
          <span v-html="highlightText(slotProps.data.name)"></span>
        </template>
      </Column>

      <Column field="region" sortable header="Region">
        <!-- Display country name with highlighted search text -->
        <template #body="slotProps">
          <span v-html="highlightText(slotProps.data.region)"></span>
        </template>
      </Column>
      <Column field="capital" sortable header="Capital">
        <!-- Display country name with highlighted search text -->
        <template #body="slotProps">
          <span v-html="highlightText(slotProps.data.capital)"></span>
        </template>
      </Column>
    </DataTable>
  </div>

  <!-- Chart container, only display the chart if have favourite list -->
  <div class="chart" v-if="chartData">
    <!-- Chart component to display population data -->
    <Chart
      type="bar"
      :data="chartData"
      :options="chartOptions"
      class="h-30rem"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import axios from "axios";
import { Country, Favourite } from "./country-interface";
import DataTable from "primevue/datatable";
import { FilterMatchMode } from "primevue/api";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";

export default defineComponent({
  name: "App",
  setup() {
    return {
      // Initialize reactive variables
      storedFavourite: [] as Favourite[],
      chartData: ref(),
      chartOptions: ref(),
      metaKey: ref(true),
      filters: ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        "country.region": {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        },
        "country.capital": {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        },
        "country.name": { value: null, matchMode: FilterMatchMode.CONTAINS },
      }),
    };
  },
  data() {
    return {
      // Initialize the countries data property
      countries: [] as Country[],
    };
  },
  components: {
    // Register components for use in the template
    DataTable,
    Column,
    InputText,
    Checkbox,
    Button,
  },
  methods: {
    // Method to fetch a list of countries
    async getCountryList() {
      const list = await axios.get<any[]>("https://restcountries.com/v3.1/all");
      var data = list.data;
      // Process the received data and map it to the countries data property
      const countryList = data.map((dataItem, index) => {
        var capital = dataItem.capital;
        if (Array.isArray(capital)) {
          capital = capital.join(", ");
        } else {
          console.log("Invalid capital data:", capital);
        }
        return {
          id: index,
          name: dataItem.name.common,
          favourite: false,
          region: dataItem.region,
          capital: capital,
          flag: dataItem.flags.png,
          population: dataItem.population,
        };
      }) as Country[];

      this.countries = this.compareList(this.storedFavourite, countryList);
    },
    // Method to compare the list of favorite countries with the list of country
    compareList(favouriteList: Favourite[], listStorage: Country[]) {
      return listStorage.map((list_2: any) => {
        const match = favouriteList.find((list_1) => list_1.id === list_2.id);
        if (match) {
          return { ...list_2, favourite: match.favourite };
        } else {
          return list_2;
        }
      });
    },
    // Method to retrieve the list of favorite countries from local storage
    getFavouriteList() {
      const storedData = localStorage.getItem("favouriteList");
      this.storedFavourite = [];
      if (storedData) {
        var data = JSON.parse(storedData);
        if (data.length > 1) {
          this.storedFavourite = data.map((item: any) => {
            return {
              id: item.id,
              favourite: item.favourite,
              population: item.population,
              name: item.name,
            };
          });
        } else {
          this.storedFavourite.push(data);
        }
        this.chartData = this.setChartData(this.storedFavourite);
      }
    },
    // Method to clear the list of favorite countries
    clearFav() {
      localStorage.removeItem("favouriteList");
      this.storedFavourite = [];
      this.getCountryList();
      this.chartData = null;
    },
    // Method to save the list of favorite countries to local storage
    saveLocalFav(store: any) {
      localStorage.setItem("favouriteList", JSON.stringify(store));
    },
    // Method to remove a country from the list of favorites
    removeFromFav(id: number) {
      const index = this.storedFavourite.findIndex(
        (element) => element.id === id
      );
      if (index !== -1) {
        this.storedFavourite.splice(index, 1);
        var length = this.storedFavourite.length;
        if (length >= 1) {
          this.saveLocalFav(this.storedFavourite);
        } else {
          this.clearFav();
        }
      } else if (index == -1) {
        console.log("Error Remove From Favourite");
      }
    },
    // Method to add a country to the favourite
    addToFavourite(id: number, value: boolean) {
      const data = this.countries.find((item) => item.id === id);
      if (data) {
        if (value == false) {
          data.favourite = true;
          var saveFav = {
            id: id,
            favourite: data.favourite,
            population: data.population,
            name: data.name,
          };
          this.storedFavourite.push(saveFav);
          this.saveLocalFav(this.storedFavourite);
          this.chartData = this.setChartData(this.storedFavourite);
        } else {
          data.favourite = false;
          this.removeFromFav(id);
          this.chartData = this.setChartData(this.storedFavourite);
        }
      } else if (!data) {
        console.log("Error Add To Favourite");
      }
    },
    // Method to highlight text that match with the search input text
    highlightText(text: string) {
      var value = this.filters["global"].value;
      if (!value) return text;
      const regex = new RegExp(value, "gi");

      return text?.replace(
        regex,
        (match) => `<span class="highlight">${match}</span>`
      );
    },

    // Method to prepare chart data from a list of favorite countries
    setChartData(data: Favourite[]) {
      const documentStyle = getComputedStyle(document.documentElement);

      var labelChart = [];
      var labelData = [];
      if (data.length == 0) {
        labelChart.push(data);
        labelData.push(data);
      } else {
        labelChart = data.map((item) => {
          return item.name;
        });
        labelData = data.map((item) => {
          return item.population;
        });
      }

      return {
        labels: labelChart,
        datasets: [
          {
            label: "Country Population",
            backgroundColor: documentStyle.getPropertyValue("--blue-500"),
            borderColor: documentStyle.getPropertyValue("--blue-500"),
            data: labelData,
          },
        ],
      };
    },
    // Method to set chart options for the population chart
    setChartOptions() {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue("--text-color");
      const textColorSecondary = documentStyle.getPropertyValue(
        "--text-color-secondary"
      );
      const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

      return {
        indexAxis: "y",
        maintainAspectRatio: false,
        aspectRatio: 0.5,
        plugins: {
          legend: {
            labels: {
              fontColor: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500,
              },
            },
            grid: {
              display: false,
              drawBorder: false,
            },
          },
          y: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
        },
      };
    },
  },
  mounted() {
    // retrieve the list of favorite countries from local storage
    this.getFavouriteList();
    // fetch the list of countries from an external API
    this.getCountryList();
    // Set chart options for the population chart
    this.chartOptions = this.setChartOptions();
  },
});
</script>

<style>
img.w-6rem.shadow-2.border-round {
  width: 30%;
}

.highlight {
  background-color: yellow;
}

.chart {
  margin: 5rem 0;
}
</style>
