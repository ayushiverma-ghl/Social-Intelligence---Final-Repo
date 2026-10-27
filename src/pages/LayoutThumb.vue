<script setup>
defineProps({ type: String })
</script>

<template>
  <div class="relative h-[88px] overflow-hidden bg-gray-50">

    <!-- ─── sidebar-simple: main sidebar + topbar + content ─── -->
    <template v-if="type === 'sidebar-simple'">
      <div class="absolute inset-y-0 left-0 w-[36px] bg-gray-600" />
      <div class="absolute left-0 top-[10px] w-[36px] h-[14px] bg-gray-500" />
      <div class="absolute left-[11px] top-[14px] w-[14px] h-[2px] rounded-full bg-primary-400" />
      <div class="absolute left-[11px] top-[30px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <div class="absolute left-[11px] top-[42px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <div class="absolute left-[11px] top-[54px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <div class="absolute left-[11px] top-[66px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <div class="absolute left-[36px] right-0 top-0 h-[21px] bg-white border-b border-gray-100" />
      <div class="absolute left-[48px] top-[7px] w-[44px] h-[7px] rounded-full bg-gray-200" />
      <div class="absolute left-[36px] right-0 top-[21px] bottom-0 bg-white" />
      <div class="absolute left-[50px] top-[35px] right-[14px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[50px] top-[47px] right-[22px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[50px] top-[59px] right-[18px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[50px] top-[71px] right-[26px] h-[5px] rounded-full bg-gray-100" />
    </template>

    <!-- ─── sidebar-tabbed: sidebar + two-level tab topbar ─── -->
    <template v-else-if="type === 'sidebar-tabbed'">
      <div class="absolute inset-y-0 left-0 w-[36px] bg-gray-600" />
      <div class="absolute left-0 top-[10px] w-[36px] h-[14px] bg-gray-500" />
      <div class="absolute left-[11px] top-[14px] w-[14px] h-[2px] rounded-full bg-primary-500" />
      <div class="absolute left-[11px] top-[32px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <div class="absolute left-[11px] top-[44px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <div class="absolute left-[11px] top-[56px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <!-- L1 tabs -->
      <div class="absolute left-[36px] right-0 top-0 h-[21px] bg-white border-b border-gray-100" />
      <div class="absolute left-[48px] top-[7px] w-[22px] h-[7px] rounded-full bg-primary-600" />
      <div class="absolute left-[76px] top-[7px] w-[18px] h-[7px] rounded-full bg-gray-200" />
      <div class="absolute left-[100px] top-[7px] w-[16px] h-[7px] rounded-full bg-gray-200" />
      <!-- L2 tabs -->
      <div class="absolute left-[36px] right-0 top-[21px] h-[17px] bg-gray-50 border-b border-gray-100" />
      <div class="absolute left-[48px] top-[26px] w-[18px] h-[6px] rounded-full bg-primary-400" />
      <div class="absolute left-[72px] top-[26px] w-[15px] h-[6px] rounded-full bg-gray-300" />
      <div class="absolute left-[93px] top-[26px] w-[15px] h-[6px] rounded-full bg-gray-300" />
      <div class="absolute left-[36px] right-0 top-[38px] bottom-0 bg-white" />
      <div class="absolute left-[50px] top-[52px] right-[14px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[50px] top-[63px] right-[22px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[50px] top-[74px] right-[18px] h-[5px] rounded-full bg-gray-100" />
    </template>

    <!-- ─── sidebar-tabbed-vtabs: sidebar + tabbed topbar + vertical tabs ─── -->
    <template v-else-if="type === 'sidebar-tabbed-vtabs'">
      <div class="absolute inset-y-0 left-0 w-[36px] bg-gray-600" />
      <div class="absolute left-0 top-[10px] w-[36px] h-[14px] bg-gray-500" />
      <div class="absolute left-[11px] top-[14px] w-[14px] h-[2px] rounded-full bg-primary-500" />
      <div class="absolute left-[11px] top-[32px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <div class="absolute left-[11px] top-[44px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <!-- L1 tabs -->
      <div class="absolute left-[36px] right-0 top-0 h-[21px] bg-white border-b border-gray-100" />
      <div class="absolute left-[48px] top-[7px] w-[22px] h-[7px] rounded-full bg-primary-600" />
      <div class="absolute left-[76px] top-[7px] w-[18px] h-[7px] rounded-full bg-gray-200" />
      <!-- L2 tabs -->
      <div class="absolute left-[36px] right-0 top-[21px] h-[17px] bg-gray-50 border-b border-gray-100" />
      <div class="absolute left-[48px] top-[26px] w-[18px] h-[6px] rounded-full bg-primary-400" />
      <div class="absolute left-[72px] top-[26px] w-[15px] h-[6px] rounded-full bg-gray-300" />
      <!-- Vertical tabs column -->
      <div class="absolute left-[36px] top-[38px] bottom-0 w-[44px] bg-gray-100 border-r border-gray-200" />
      <div class="absolute left-[44px] top-[47px] w-[28px] h-[6px] rounded-full bg-primary-500" />
      <div class="absolute left-[44px] top-[59px] w-[24px] h-[6px] rounded-full bg-gray-300" />
      <div class="absolute left-[44px] top-[71px] w-[24px] h-[6px] rounded-full bg-gray-300" />
      <div class="absolute left-[80px] right-0 top-[38px] bottom-0 bg-white" />
      <div class="absolute left-[92px] top-[52px] right-[12px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[92px] top-[63px] right-[18px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[92px] top-[74px] right-[14px] h-[5px] rounded-full bg-gray-100" />
    </template>

    <!-- ─── sidebar-vtabs-back: sidebar + topbar with back + vtab row ─── -->
    <template v-else-if="type === 'sidebar-vtabs-back'">
      <div class="absolute inset-y-0 left-0 w-[36px] bg-gray-600" />
      <div class="absolute left-0 top-[10px] w-[36px] h-[14px] bg-gray-500" />
      <div class="absolute left-[11px] top-[14px] w-[14px] h-[2px] rounded-full bg-primary-500" />
      <div class="absolute left-[11px] top-[32px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <div class="absolute left-[11px] top-[44px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <!-- Topbar with back indicator -->
      <div class="absolute left-[36px] right-0 top-0 h-[21px] bg-white border-b border-gray-100" />
      <div class="absolute left-[44px] top-[7px] w-[7px] h-[7px] rounded-[2px] bg-gray-300" />
      <div class="absolute left-[57px] top-[7px] w-[36px] h-[7px] rounded-full bg-gray-200" />
      <!-- Vtab row (horizontal) -->
      <div class="absolute left-[36px] right-0 top-[21px] h-[17px] bg-gray-50 border-b border-gray-100" />
      <div class="absolute left-[48px] top-[25px] w-[22px] h-[7px] rounded-full bg-primary-600" />
      <div class="absolute left-[76px] top-[25px] w-[18px] h-[7px] rounded-full bg-gray-300" />
      <div class="absolute left-[100px] top-[25px] w-[18px] h-[7px] rounded-full bg-gray-300" />
      <div class="absolute left-[36px] right-0 top-[38px] bottom-0 bg-white" />
      <div class="absolute left-[50px] top-[52px] right-[14px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[50px] top-[63px] right-[22px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[50px] top-[74px] right-[18px] h-[5px] rounded-full bg-gray-100" />
    </template>

    <!-- ─── level2: sidebar + list panel + detail panel ─── -->
    <template v-else-if="type === 'level2'">
      <div class="absolute inset-y-0 left-0 w-[36px] bg-gray-600" />
      <div class="absolute left-[11px] top-[14px] w-[14px] h-[2px] rounded-full bg-primary-500" />
      <div class="absolute left-[11px] top-[28px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <div class="absolute left-[11px] top-[40px] w-[14px] h-[2px] rounded-full bg-gray-400" />
      <!-- L1 list panel -->
      <div class="absolute left-[36px] top-0 bottom-0 w-[78px] bg-gray-50 border-r border-gray-200" />
      <div class="absolute left-[36px] top-0 w-[78px] h-[21px] bg-white border-b border-gray-100" />
      <div class="absolute left-[48px] top-[7px] w-[36px] h-[7px] rounded-full bg-gray-200" />
      <!-- list rows -->
      <div class="absolute left-[36px] top-[22px] w-[78px] h-[13px] bg-primary-50 border-l-[3px] border-primary-600" />
      <div class="absolute left-[50px] top-[27px] w-[36px] h-[4px] rounded-full bg-primary-300" />
      <div class="absolute left-[50px] top-[41px] w-[32px] h-[4px] rounded-full bg-gray-300" />
      <div class="absolute left-[50px] top-[55px] w-[36px] h-[4px] rounded-full bg-gray-300" />
      <div class="absolute left-[50px] top-[69px] w-[28px] h-[4px] rounded-full bg-gray-300" />
      <!-- L2 detail panel -->
      <div class="absolute left-[114px] right-0 top-0 bottom-0 bg-white" />
      <div class="absolute left-[114px] right-0 top-0 h-[21px] bg-white border-b border-gray-100" />
      <div class="absolute left-[122px] top-[7px] w-[7px] h-[7px] rounded-[2px] bg-gray-300" />
      <div class="absolute left-[135px] top-[7px] w-[36px] h-[7px] rounded-full bg-gray-200" />
      <div class="absolute left-[126px] top-[34px] right-[10px] h-[7px] rounded-full bg-gray-200" />
      <div class="absolute left-[126px] top-[48px] right-[14px] h-[4px] rounded-full bg-gray-100" />
      <div class="absolute left-[126px] top-[58px] right-[18px] h-[4px] rounded-full bg-gray-100" />
      <div class="absolute left-[126px] top-[68px] right-[22px] h-[4px] rounded-full bg-gray-100" />
    </template>

    <!-- ─── fullscreen-builder: builder bar + full canvas ─── -->
    <template v-else-if="type === 'fullscreen-builder'">
      <div class="absolute left-0 right-0 top-0 h-[26px] bg-gray-600" />
      <div class="absolute left-[12px] top-[9px] w-[56px] h-[7px] rounded-full bg-gray-600" />
      <div class="absolute right-[30px] top-[8px] w-[22px] h-[10px] rounded-[2px] bg-gray-400" />
      <div class="absolute right-[4px] top-[8px] w-[22px] h-[10px] rounded-[2px] bg-primary-600" />
      <div class="absolute left-0 right-0 top-[26px] bottom-0 bg-white" />
      <!-- canvas grid dots using box shadows trick -->
      <div class="absolute left-0 right-0 top-[26px] bottom-0 opacity-60"
        style="background-image: radial-gradient(circle, var(--color-gray-200) 1px, transparent 1px); background-size: 14px 14px; background-position: 7px 7px;" />
    </template>

    <!-- ─── fullscreen-vtabs-back: topbar + vtab row + full content ─── -->
    <template v-else-if="type === 'fullscreen-vtabs-back'">
      <div class="absolute left-0 right-0 top-0 h-[21px] bg-white border-b border-gray-100" />
      <div class="absolute left-[8px] top-[7px] w-[7px] h-[7px] rounded-[2px] bg-gray-300" />
      <div class="absolute left-[21px] top-[7px] w-[44px] h-[7px] rounded-full bg-gray-200" />
      <!-- vtab row -->
      <div class="absolute left-0 right-0 top-[21px] h-[17px] bg-gray-50 border-b border-gray-100" />
      <div class="absolute left-[12px] top-[25px] w-[26px] h-[7px] rounded-full bg-primary-600" />
      <div class="absolute left-[44px] top-[25px] w-[20px] h-[7px] rounded-full bg-gray-300" />
      <div class="absolute left-[70px] top-[25px] w-[20px] h-[7px] rounded-full bg-gray-300" />
      <div class="absolute left-[96px] top-[25px] w-[20px] h-[7px] rounded-full bg-gray-300" />
      <div class="absolute left-0 right-0 top-[38px] bottom-0 bg-white" />
      <div class="absolute left-[16px] top-[52px] right-[16px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[16px] top-[63px] right-[28px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[16px] top-[74px] right-[22px] h-[5px] rounded-full bg-gray-100" />
    </template>

    <!-- ─── settings-tabbed: settings sidebar + tab topbar ─── -->
    <template v-else-if="type === 'settings-tabbed'">
      <div class="absolute inset-y-0 left-0 w-[44px] bg-gray-100 border-r border-gray-200" />
      <div class="absolute left-[6px] top-[9px] w-[32px] h-[11px] bg-white rounded-[2px]" />
      <div class="absolute left-[10px] top-[12px] w-[24px] h-[5px] rounded-full bg-primary-600" />
      <div class="absolute left-[10px] top-[27px] w-[20px] h-[4px] rounded-full bg-gray-400" />
      <div class="absolute left-[10px] top-[37px] w-[22px] h-[4px] rounded-full bg-gray-400" />
      <div class="absolute left-[10px] top-[47px] w-[18px] h-[4px] rounded-full bg-gray-400" />
      <div class="absolute left-[10px] top-[57px] w-[20px] h-[4px] rounded-full bg-gray-400" />
      <div class="absolute left-[44px] right-0 top-0 h-[21px] bg-white border-b border-gray-100" />
      <div class="absolute left-[56px] top-[7px] w-[20px] h-[7px] rounded-full bg-primary-600" />
      <div class="absolute left-[82px] top-[7px] w-[18px] h-[7px] rounded-full bg-gray-200" />
      <div class="absolute left-[106px] top-[7px] w-[18px] h-[7px] rounded-full bg-gray-200" />
      <div class="absolute left-[44px] right-0 top-[21px] bottom-0 bg-white" />
      <div class="absolute left-[58px] top-[35px] right-[14px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[58px] top-[47px] right-[22px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[58px] top-[59px] right-[18px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[58px] top-[71px] right-[26px] h-[5px] rounded-full bg-gray-100" />
    </template>

    <!-- ─── settings-vtabs: settings sidebar + vtab column + content ─── -->
    <template v-else-if="type === 'settings-vtabs'">
      <div class="absolute inset-y-0 left-0 w-[44px] bg-gray-100 border-r border-gray-200" />
      <div class="absolute left-[6px] top-[9px] w-[32px] h-[11px] bg-white rounded-[2px]" />
      <div class="absolute left-[10px] top-[12px] w-[24px] h-[5px] rounded-full bg-primary-600" />
      <div class="absolute left-[10px] top-[27px] w-[20px] h-[4px] rounded-full bg-gray-400" />
      <div class="absolute left-[10px] top-[37px] w-[22px] h-[4px] rounded-full bg-gray-400" />
      <div class="absolute left-[10px] top-[47px] w-[18px] h-[4px] rounded-full bg-gray-400" />
      <!-- topbar -->
      <div class="absolute left-[44px] right-0 top-0 h-[21px] bg-white border-b border-gray-100" />
      <div class="absolute left-[56px] top-[7px] w-[32px] h-[7px] rounded-full bg-gray-200" />
      <!-- vtabs column -->
      <div class="absolute left-[44px] top-[21px] bottom-0 w-[44px] bg-gray-50 border-r border-gray-100" />
      <div class="absolute left-[52px] top-[31px] w-[28px] h-[6px] rounded-full bg-primary-600" />
      <div class="absolute left-[52px] top-[43px] w-[24px] h-[6px] rounded-full bg-gray-300" />
      <div class="absolute left-[52px] top-[55px] w-[24px] h-[6px] rounded-full bg-gray-300" />
      <div class="absolute left-[52px] top-[67px] w-[24px] h-[6px] rounded-full bg-gray-300" />
      <div class="absolute left-[88px] right-0 top-[21px] bottom-0 bg-white" />
      <div class="absolute left-[100px] top-[35px] right-[12px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[100px] top-[47px] right-[18px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[100px] top-[59px] right-[14px] h-[5px] rounded-full bg-gray-100" />
    </template>

    <!-- ─── settings-vtabs-back: settings sidebar + back topbar + vtab row ─── -->
    <template v-else-if="type === 'settings-vtabs-back'">
      <div class="absolute inset-y-0 left-0 w-[44px] bg-gray-100 border-r border-gray-200" />
      <div class="absolute left-[6px] top-[9px] w-[32px] h-[11px] bg-white rounded-[2px]" />
      <div class="absolute left-[10px] top-[12px] w-[24px] h-[5px] rounded-full bg-primary-600" />
      <div class="absolute left-[10px] top-[27px] w-[20px] h-[4px] rounded-full bg-gray-400" />
      <div class="absolute left-[10px] top-[37px] w-[22px] h-[4px] rounded-full bg-gray-400" />
      <div class="absolute left-[10px] top-[47px] w-[18px] h-[4px] rounded-full bg-gray-400" />
      <!-- Topbar with back -->
      <div class="absolute left-[44px] right-0 top-0 h-[21px] bg-white border-b border-gray-100" />
      <div class="absolute left-[52px] top-[7px] w-[7px] h-[7px] rounded-[2px] bg-gray-300" />
      <div class="absolute left-[65px] top-[7px] w-[32px] h-[7px] rounded-full bg-gray-200" />
      <!-- vtab row -->
      <div class="absolute left-[44px] right-0 top-[21px] h-[17px] bg-gray-50 border-b border-gray-100" />
      <div class="absolute left-[56px] top-[25px] w-[22px] h-[7px] rounded-full bg-primary-600" />
      <div class="absolute left-[84px] top-[25px] w-[18px] h-[7px] rounded-full bg-gray-300" />
      <div class="absolute left-[108px] top-[25px] w-[18px] h-[7px] rounded-full bg-gray-300" />
      <div class="absolute left-[44px] right-0 top-[38px] bottom-0 bg-white" />
      <div class="absolute left-[58px] top-[52px] right-[14px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[58px] top-[63px] right-[22px] h-[5px] rounded-full bg-gray-100" />
      <div class="absolute left-[58px] top-[74px] right-[18px] h-[5px] rounded-full bg-gray-100" />
    </template>

  </div>
</template>
