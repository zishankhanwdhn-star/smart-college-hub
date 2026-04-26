import { useState, useEffect, useCallback } from 'react'
import { resourceAPI, academicAPI } from '../services/api'

// Hook: fetch resources for a unit
export function useUnitResources(unitId, contentType = null) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!unitId) return
    setLoading(true); setError(null)
    try {
      const r = await resourceAPI.getByUnit(unitId, contentType)
      setResources(r.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load resources')
    } finally { setLoading(false) }
  }, [unitId, contentType])

  useEffect(() => { fetch() }, [fetch])

  return { resources, loading, error, refetch: fetch }
}

// Hook: my uploads
export function useMyUploads() {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    resourceAPI.myUploads()
      .then(r => setUploads(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { uploads, loading }
}

// Hook: academic cascade
export function useAcademicCascade() {
  const [branches, setBranches] = useState([])
  const [semesters, setSemesters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [units, setUnits] = useState([])
  const [selBranch, setSelBranch] = useState('')
  const [selSem, setSelSem] = useState('')
  const [selSubject, setSelSubject] = useState('')
  const [selUnit, setSelUnit] = useState('')

  useEffect(() => {
    academicAPI.getBranches().then(r => setBranches(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selBranch) { setSemesters([]); setSelSem(''); return }
    academicAPI.getSemesters(selBranch).then(r => setSemesters(r.data)).catch(() => {})
    setSelSem(''); setSubjects([]); setSelSubject(''); setUnits([]); setSelUnit('')
  }, [selBranch])

  useEffect(() => {
    if (!selSem) { setSubjects([]); setSelSubject(''); return }
    academicAPI.getSubjects(selSem).then(r => setSubjects(r.data)).catch(() => {})
    setSelSubject(''); setUnits([]); setSelUnit('')
  }, [selSem])

  useEffect(() => {
    if (!selSubject) { setUnits([]); setSelUnit(''); return }
    academicAPI.getUnits(selSubject).then(r => setUnits(r.data)).catch(() => {})
    setSelUnit('')
  }, [selSubject])

  return {
    branches, semesters, subjects, units,
    selBranch, setSelBranch,
    selSem, setSelSem,
    selSubject, setSelSubject,
    selUnit, setSelUnit,
  }
}
