<script setup>
</script>

<template>
  <!-- HighRise's root provider. It sets naive's class prefix to `hr`, the HighRise version
       namespace (also stamped on teleported modals, menus and tooltips) and HighRise's theme,
       which is what HighRise's stylesheet is scoped to. Without it every HL component
       renders on naive's defaults instead of HighRise's own styling. -->
  <!-- Toasts sit at the top, centred over the page content rather than the window: 64px clears
       the top navigation, and 140px is half the sidebar (8 Oct, T2). -->
  <HLContentWrap full-screen :notification-config="{ placement: 'top', max: 3, containerStyle: { marginTop: '64px', marginLeft: '140px' } }">
    <RouterView />
  </HLContentWrap>
</template>
