/* onKeyDowm */
export const handleSaveContentAfterPressEnter = (e) => {
   if (e.key === "Enter") {
      e.target.blur();
   }
};

/* Select all input value when click */
export const selectAllInLineText = (e) => {
   e.target.focus();
   e.target.select();
};
