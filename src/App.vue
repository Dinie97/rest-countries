<template>
  <div class="card">
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
      <Column field="favourite" header="Favourite">
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
        <template #body="slotProps">
          <span v-html="highlightName(slotProps.data.name)"></span>
        </template>
      </Column>

      <Column field="region" sortable header="Region">
        <template #body="slotProps">
          <span v-html="highlightRegion(slotProps.data.region)"></span>
        </template>
      </Column>
      <Column field="capital" sortable header="Capital">
        <template #body="slotProps">
          <span v-html="highlightCapital(slotProps.data.capital)"></span>
        </template>
      </Column>
    </DataTable>
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
      storedArray: [] as Favourite[],

      selectedCountry: ref(),
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
      countries: [] as Country[],
    };
  },
  components: {
    DataTable,
    Column,
    InputText,
    Checkbox,
    Button,
  },
  methods: {
    async fetchUsers() {
      const user = await axios.get<any[]>("https://restcountries.com/v3.1/all");
      var data = user.data;

      const newJsonData = data.map((dataItem, index) => {
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
        };
      }) as Country[];
      // newJsonData.sort((a, b) => a.name.localeCompare(b.name));

      this.countries = this.compareList(this.storedArray, newJsonData);
    },
    compareList(favouriteList: Favourite[], listStorage: Country[]) {
      return listStorage.map((list_2: any) => {
        const match = favouriteList.find((list_1) => list_1.id === list_2.id);
        if (match) {
          return { ...list_2, favourite: match.favourite };
        } else if (match == undefined) {
          return list_2;
        }
      });
    },
    getFavouriteList() {
      const storedData = localStorage.getItem("favouriteList");
      this.storedArray = [];

      if (storedData) {
        var data = JSON.parse(storedData);
        if (data.length > 1) {
          this.storedArray = data.map((item: any) => {
            return {
              id: item.id,
              favourite: item.favourite,
            };
          });
          console.log(this.storedArray);
        } else if (data.length == 0) {
          this.storedArray.push(data);
        }
      }
    },

    clearFav() {
      localStorage.removeItem("favouriteList");
      this.storedArray = [];
      console.log(this.filters["global"]);
    },
    saveLocalFav(store: any) {
      localStorage.setItem("favouriteList", JSON.stringify(store));
    },
    async removeFromFav(id: number) {
      const index = this.storedArray.findIndex((element) => element.id === id);
      if (index !== -1) {
        // const data = this.storedArray[index];
        this.storedArray.splice(index, 1);
        var length = this.storedArray.length;
        if (length >= 1) {
          this.saveLocalFav(this.storedArray);
        } else {
          this.clearFav();
        }
      } else if (index == -1) {
        console.log("Error Remove From Favourite");
      }
    },
    async addToFavourite(id: number, value: boolean) {
      const data = this.countries.find((item) => item.id === id);

      if (data) {
        if (value == false) {
          data.favourite = true;
          var saveFav = {
            id: id,
            favourite: data.favourite,
          };

          this.storedArray.push(saveFav);
          this.saveLocalFav(this.storedArray);

          console.log(this.storedArray);
          // }
        } else if (value == true) {
          data.favourite = false;
          this.removeFromFav(id);
        }
      } else if (!data) {
        console.log("Error Add To Favourite");
      }
      console.log(data?.favourite);
    },

    highlightText(text: string) {
      var value = this.filters["global"].value;
      if (!value) return text;
      const regex = new RegExp(value, "gi");

      return text.replace(
        regex,
        (match) => `<span class="highlight">${match}</span>`
      );
    },
    highlightCapital(text: string) {
      let value = this.filters["global"].value;

      if (!value) return text;
      const regex = new RegExp(value, "gi");

      return text?.replace(
        regex,
        (match) => `<span class="highlight">${match}</span>`
      );
    },
    highlightName(rowData: any) {
      return this.highlightText(rowData);
    },
    highlightRegion(rowData: any) {
      return this.highlightText(rowData);
    },
    escapeRegExp(string: string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    },
  },
  mounted() {
    this.getFavouriteList();
    this.fetchUsers();
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
</style>
