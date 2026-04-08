<PatientProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<AllPatients />} />
        <Route path="patients/:id" element={<ViewPatient />} />
      </Route>
    </Routes>
  </BrowserRouter>
</PatientProvider>