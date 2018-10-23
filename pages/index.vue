<template>
  <section>
    <div>
      <fa class="has-text-primary" :icon="fas.faUserLock" size="6x" />
    </div>
    <form v-on:submit.prevent="submit" class="box">
      <b-field grouped :type="fieldType" :message="message">
        <b-input v-model="token" placeholder="Token" expanded></b-input>
        <p class="control">
            <button type="submit" class="button is-primary">Submit</button>
        </p>
      </b-field>
    </form>
  </section>
</template>

<style scoped>
svg {
  max-height: 300px;

  height: auto !important; /* overrides inline */
  width: auto !important; /* overrides inline */

  display: block;
  max-width: 100%;

  padding: 50px;
}


</style>

<script>
//import BLogo from '@/components/Logo'
import axios from 'axios'
import { Base64 } from 'js-base64';
import { fas } from '@fortawesome/free-solid-svg-icons'

const urlRegex = /(?:([-\/?&])\1|[^A-Za-z0-9\/&=?-])/

export default {
  name: 'Auth',
  components: {},

  computed: {
      fas () {
         return fas
      }
  },

  data() {
      return {
        token: "",
        fieldType: null,
        message: ""
      }
  },

  methods: {
    submit: function(e) {
      let token = this.token;
      axios.post('/.auth-validate', { token }).then(res => {
        if(res.data.msg == 'ok') {
          let query = this.$route.query;
          let path = query.dst ? Base64.decode(query.dst) : '/'
          if(!urlRegex.test(path)) {
            window.location = `..${path}`
          } else {
            console.log("Error", "Malformed path")
          }
        } else {
          this.fieldType = "is-danger"
        }
      })
    }
  }
}
</script>^
