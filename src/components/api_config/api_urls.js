
export const API_URLS = {
    REGISTRATION: {
      POST_REGISTRATION: "api/register/",
      GET_REGISTRATION: "api/register/",
      PATCH_REGISTRATION:(uuid)=>`api/register/${uuid}/`
  
    },
  
   PERSONAL_DETAILS:{
    POST_PERSONAL_DETAILS:"/api/personal-details/create/",
    PATCH_PERSONAL_DETAILS:(uuid)=>`api/personal-details/${uuid}/`,
    GET_PERSONAL_DETAILS:(uuid)=>`api/personal-details/${uuid}/`


   },

   ADDRESS: {
    POST_ADDRESS: "/api/addresses/create/",
    PATCH_ADDRESSES:(id)=>`api/addresses/${id}/`,
    GET_ADDRESSES_ID:(id)=>`api/addresses/${id}/`,
    GET_ADDRESSES_UUID:(uuid)=>`api/address/list/${uuid}/`


   },

   OFFICIAL_ID: {
    POST_OFFICIAL_ID: "/api/official-id/create/",
    GET_IDCARD_ID:(uuid)=>`api/idcards/${uuid}/`,
    PATCH_IDCARD_ID:(uuid)=>`api/idcards/edit/${uuid}/`


   },



   EDUCATION_EMPLOYMENT: {
    POST_EDUCATION_EMPLOYMENT: "/api/education-employment/create/",
    PATCH_EDUCATION_EMPLOYMENT:(uuid)=>`api/education-employment/${uuid}/`,
    GET_EDUCATION_EMPLOYMENT_ID:(uuid)=>`api/education-employment/list/${uuid}/`

   },

   DOCUMENTS: {
    POST_DOCUMENTS: "/api/documents/",
    PATCH_DOCUMENTS:(uuid)=>`api/documents/${uuid}/`,
    GET_DOCUMENTS_ID:(uuid)=>`api/documents/${uuid}/`

   }
  
  };
  