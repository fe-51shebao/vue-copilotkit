<template>
  <el-form :model="form" label-width="auto" style="min-width: 600px">
    <el-form-item label="姓名">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="form.gender">
        <el-radio v-for="genderOption in genderOptions" :key="genderOption.value" :value="genderOption.value">{{ genderOption.label }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="电话">
      <el-input v-model="form.phone" />
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input v-model="form.email" />
    </el-form-item>
    <el-form-item label="爱好">
      <el-checkbox-group v-model="form.hobby">
        <el-checkbox v-for="hobbyOption in hobbyOptions" :key="hobbyOption.value" :value="hobbyOption.value" :label="hobbyOption.label" name="type" />
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="出生日期">
      <el-date-picker v-model="form.date" type="date" placeholder="Pick a day" style="width: 100%;" />
    </el-form-item>
    <el-form-item label="地址1">
      <el-input type="textarea" v-model="form.address1" />
    </el-form-item>
    <el-form-item label="地址2">
      <el-input type="textarea" v-model="form.address2" />
    </el-form-item>
    <el-form-item>
      <div class="flex justify-center w-full">
        <el-button type="primary" @click="onSubmit">添加</el-button>
        <el-button>取消</el-button>
      </div>
    </el-form-item>
  </el-form>

  <!-- copilot -->
  <CopilotPopup />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CopilotPopup } from '@copilotkit/vue-ui'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/vue-core'

// do not use same name with ref
const form = ref({
  name: '',
  gender: '0',
  phone: '',
  email: '',
  hobby: [],
  date: '',
  address1: '',
  address2: ''
})

const genderOptions = [
  { value: '0', label: '未知' },
  { value: '1', label: '男' },
  { value: '2', label: '女' }
]

const hobbyOptions = [
  { value: '1', label: '足球' },
  { value: '2', label: '篮球' },
  { value: '3', label: '排球' }
]
useCopilotReadable({
  description: "The user's information.",
  value: form.value
})
useCopilotReadable({
  description: "The hobby list.",
  value: hobbyOptions
})
useCopilotReadable({
  description: "The gender list.",
  value: genderOptions
})

useCopilotAction({
    name: "updateUserInfo",
    description: "Update the user's information",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "The name of the user",
      },
      {
        name: "gender",
        type: "string",
        description: "The gender of the user, the gender list is the same as the gender options",
      },
      {
        name: "phone",
        type: "string",
        description: "The phone of the user",
      },
      {
        name: "email",
        type: "string",
        description: "The email of the user",
      },
      {
        name: "hobby",
        type: "string[]",
        description: "The hobby of the user, the hobby list is the same as the hobby options",
      },
      {
        name: "date",
        type: "string",
        description: "The date of the user, format: YYYY-MM-DD",
      },
      {
        name: "address1",
        type: "string",
        description: "The address1 of the user, contains the province and city",
      },
      {
        name: "address2",
        type: "string",
        description: "The address2 of the user, contains the street and house number",
      }
    ],
    handler: (info) => {
      console.log(info)
      form.value = info
    }
  });
const onSubmit = () => {
  console.log('submit!')
}
</script>
